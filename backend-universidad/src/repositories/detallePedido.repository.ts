import type { PrismaClient, Prisma } from "@prisma/client";
import type { ClienteDb } from "./tipos.ts";

export interface NuevoDetalle {
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: Prisma.Decimal;
}

export class DetallePedidoRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  findMany() {
    return this.prisma.detallePedido.findMany();
  }

  create(datos: NuevoDetalle, db: ClienteDb = this.prisma) {
    return db.detallePedido.create({ data: datos });
  }
}
