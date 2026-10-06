import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { DetallePedidoRepository } from "../repositories/detallePedido.repository.ts";
import { PedidoRepository } from "../repositories/pedido.repository.ts";
import { ProductoRepository } from "../repositories/producto.repository.ts";
import { UsuarioRepository } from "../repositories/usuario.repository.ts";
import {
  ProductoNoEncontradoError,
  StockInsuficienteError,
  UsuarioNoEncontradoError,
} from "../errors/errores.ts";

export interface ProductoComprado {
  productoId: number;
  cantidad: number;
}

export interface Repositorios {
  usuarios: UsuarioRepository;
  productos: ProductoRepository;
  pedidos: PedidoRepository;
  detalles: DetallePedidoRepository;
}

export class PedidoService {
  private readonly prisma: PrismaClient;
  private readonly repos: Repositorios;

  constructor(prisma: PrismaClient, repos: Repositorios) {
    this.prisma = prisma;
    this.repos = repos;
  }

  /**
   * Procesa un checkout dentro de UNA transacción (ACID):
   *  1. crea el pedido asociado al usuario
   *  2. por cada producto resta stock; si queda negativo lanza un error
   *     => Prisma hace ROLLBACK y no queda ningún cambio en la base
   *  3. crea los DetallePedido y calcula el total
   *  4. actualiza el pedido con el total => COMMIT al terminar el callback
   */
  procesarCheckout(usuarioId: number, productosComprados: ProductoComprado[]) {
    return this.prisma.$transaction(async (tx) => {
      const usuario = await this.repos.usuarios.findById(usuarioId, tx);
      if (!usuario) {
        throw new UsuarioNoEncontradoError(usuarioId);
      }

      const pedido = await this.repos.pedidos.create(usuarioId, tx);
      let total = new Prisma.Decimal(0);

      for (const item of productosComprados) {
        const producto = await this.repos.productos.findById(item.productoId, tx);
        if (!producto) {
          throw new ProductoNoEncontradoError(item.productoId);
        }

        const actualizado = await this.repos.productos.descontarStock(
          item.productoId,
          item.cantidad,
          tx
        );

        // Validación crítica: stock negativo => error => ROLLBACK
        if (actualizado.stock < 0) {
          throw new StockInsuficienteError(producto.id, producto.nombre);
        }

        await this.repos.detalles.create(
          {
            pedidoId: pedido.id,
            productoId: producto.id,
            cantidad: item.cantidad,
            precioUnitario: producto.precio,
          },
          tx
        );

        total = total.plus(producto.precio.times(item.cantidad));
      }

      await this.repos.pedidos.actualizarTotal(pedido.id, total, tx);

      // Pedido finalizado, con sus detalles, para devolver al cliente.
      const finalizado = await this.repos.pedidos.findById(pedido.id, tx);
      return finalizado!;
    });
  }
}
