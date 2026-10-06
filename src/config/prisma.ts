import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const urlConexion = process.env.DATABASE_URL;

if (!urlConexion) {
  throw new Error(
    "Falta la variable de entorno DATABASE_URL. Copiá .env.example a .env y completala."
  );
}

// Prisma 7 se conecta a PostgreSQL a través de un "driver adapter".
const adaptador = new PrismaPg({ connectionString: urlConexion });

// Una única instancia de PrismaClient para toda la aplicación.
export const prisma = new PrismaClient({ adapter: adaptador });
