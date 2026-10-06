import type { PrismaClient, Prisma } from "@prisma/client";

// Los repositorios aceptan tanto el cliente normal como el cliente
// transaccional (tx) que entrega prisma.$transaction().
export type ClienteDb = PrismaClient | Prisma.TransactionClient;
