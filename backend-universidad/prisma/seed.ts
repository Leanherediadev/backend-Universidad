import { prisma } from "../src/config/prisma.ts";

async function main() {
  const usuario = await prisma.usuario.upsert({
    where: { email: "ana@universidad.edu" },
    update: {},
    create: { nombre: "Ana Pérez", email: "ana@universidad.edu" },
  });

  if ((await prisma.producto.count()) === 0) {
    await prisma.producto.createMany({
      data: [
        { nombre: "Cuaderno", precio: "1500.50", stock: 10 },
        { nombre: "Lapicera", precio: "350.00", stock: 50 },
        { nombre: "Mochila", precio: "25000.00", stock: 3 },
      ],
    });
  }

  console.log("Usuario de prueba:", usuario);
  console.log("Productos:", await prisma.producto.findMany({ orderBy: { id: "asc" } }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
