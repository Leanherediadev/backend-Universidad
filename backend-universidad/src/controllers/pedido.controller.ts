import type { Request, Response } from "express";
import type { PedidoService } from "../services/pedido.service.ts";
import { validarCheckout } from "../validators/pedido.validator.ts";
import {
  ProductoNoEncontradoError,
  StockInsuficienteError,
  UsuarioNoEncontradoError,
} from "../errors/errores.ts";

export type ServicioCheckout = Pick<PedidoService, "procesarCheckout">;

export class PedidoController {
  private readonly servicio: ServicioCheckout;

  constructor(servicio: ServicioCheckout) {
    this.servicio = servicio;
  }

  // POST /api/pedidos
  crear = async (req: Request, res: Response) => {
    const validacion = validarCheckout(req.body);

    if (!validacion.valido) {
      res.status(400).json({
        error: "Datos de entrada inválidos",
        detalles: validacion.errores,
      });
      return;
    }

    const { usuarioId, productosComprados } = validacion.datos;

    try {
      const pedido = await this.servicio.procesarCheckout(usuarioId, productosComprados);
      res.status(201).json(pedido);
    } catch (error) {
      if (error instanceof StockInsuficienteError) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (
        error instanceof UsuarioNoEncontradoError ||
        error instanceof ProductoNoEncontradoError
      ) {
        res.status(422).json({ error: error.message });
        return;
      }
      throw error; // lo resuelve el manejador de errores global (500)
    }
  };
}
