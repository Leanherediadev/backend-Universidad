import type { PrismaClient } from "@prisma/client";
import type { ClienteDb } from "./tipos.ts";

export class UsuarioRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  findMany() {
    return this.prisma.usuario.findMany();
  }

  findById(id: number, db: ClienteDb = this.prisma) {
    return db.usuario.findUnique({ where: { id } });
  }

  create(datos: { nombre: string; email: string }, db: ClienteDb = this.prisma) {
    return db.usuario.create({ data: datos });
  }
}
