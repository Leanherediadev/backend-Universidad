import type { PrismaClient, Prisma } from "@prisma/client";
import type { ClienteDb } from "./tipos.ts";

export class PedidoRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  findMany() {
    return this.prisma.pedido.findMany({ include: { detalles: true } });
  }

  findById(id: number, db: ClienteDb = this.prisma) {
    return db.pedido.findUnique({ where: { id }, include: { detalles: true } });
  }

  // Crea el pedido con su relación al usuario (total inicial en 0).
  create(usuarioId: number, db: ClienteDb = this.prisma) {
    return db.pedido.create({
      data: { usuario: { connect: { id: usuarioId } } },
    });
  }

  actualizarTotal(id: number, total: Prisma.Decimal, db: ClienteDb = this.prisma) {
    return db.pedido.update({ where: { id }, data: { total } });
  }
}
