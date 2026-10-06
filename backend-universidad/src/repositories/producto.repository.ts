import type { PrismaClient } from "@prisma/client";
import type { ClienteDb } from "./tipos.ts";

export class ProductoRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  findMany() {
    return this.prisma.producto.findMany();
  }

  findById(id: number, db: ClienteDb = this.prisma) {
    return db.producto.findUnique({ where: { id } });
  }

  create(
    datos: { nombre: string; precio: number | string; stock: number },
    db: ClienteDb = this.prisma
  ) {
    return db.producto.create({ data: datos });
  }

  // Resta stock de forma atómica en SQL (stock = stock - cantidad)
  // y devuelve el producto ya actualizado.
  descontarStock(id: number, cantidad: number, db: ClienteDb = this.prisma) {
    return db.producto.update({
      where: { id },
      data: { stock: { decrement: cantidad } },
    });
  }
}
