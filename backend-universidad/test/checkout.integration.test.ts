// Test de integración contra PostgreSQL real.
// Solo corre si existe DATABASE_URL (ver script "test:db"); crea sus propios
// datos con un email único y los borra al terminar.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const hayBase = Boolean(process.env.DATABASE_URL);

if (!hayBase) {
  test("integración checkout (omitido: no hay DATABASE_URL)", { skip: true }, () => {});
} else {
  const { prisma } = await import("../src/config/prisma.ts");
  const { PedidoService } = await import("../src/services/pedido.service.ts");
  const { UsuarioRepository } = await import("../src/repositories/usuario.repository.ts");
  const { ProductoRepository } = await import("../src/repositories/producto.repository.ts");
  const { PedidoRepository } = await import("../src/repositories/pedido.repository.ts");
  const { DetallePedidoRepository } = await import(
    "../src/repositories/detallePedido.repository.ts"
  );
  const { StockInsuficienteError } = await import("../src/errors/errores.ts");

  const servicio = new PedidoService(prisma, {
    usuarios: new UsuarioRepository(prisma),
    productos: new ProductoRepository(prisma),
    pedidos: new PedidoRepository(prisma),
    detalles: new DetallePedidoRepository(prisma),
  });

  let usuarioId = 0;
  let productoAId = 0; // precio 100.50, stock 10
  let productoBId = 0; // precio 20.00, stock 1

  before(async () => {
    const usuario = await prisma.usuario.create({
      data: { nombre: "Test", email: `test-${Date.now()}@integracion.local` },
    });
    const a = await prisma.producto.create({
      data: { nombre: "Test A", precio: "100.50", stock: 10 },
    });
    const b = await prisma.producto.create({
      data: { nombre: "Test B", precio: "20.00", stock: 1 },
    });
    usuarioId = usuario.id;
    productoAId = a.id;
    productoBId = b.id;
  });

  after(async () => {
    const pedidos = await prisma.pedido.findMany({ where: { usuarioId } });
    const ids = pedidos.map((p) => p.id);
    await prisma.detallePedido.deleteMany({ where: { pedidoId: { in: ids } } });
    await prisma.pedido.deleteMany({ where: { usuarioId } });
    await prisma.producto.deleteMany({ where: { id: { in: [productoAId, productoBId] } } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  test("checkout exitoso: descuenta stock, crea detalles y calcula el total", async () => {
    const pedido = await servicio.procesarCheckout(usuarioId, [
      { productoId: productoAId, cantidad: 2 },
      { productoId: productoBId, cantidad: 1 },
    ]);

    assert.equal(pedido.detalles.length, 2);
    assert.equal(pedido.total.toString(), "221"); // 2*100.50 + 1*20.00

    const a = await prisma.producto.findUnique({ where: { id: productoAId } });
    const b = await prisma.producto.findUnique({ where: { id: productoBId } });
    assert.equal(a?.stock, 8);
    assert.equal(b?.stock, 0);
  });

  test("sin stock: lanza error y hace ROLLBACK de todo", async () => {
    const pedidosAntes = await prisma.pedido.count({ where: { usuarioId } });

    // La 1ra línea es válida (A: 8 -> 7) pero la 2da deja B en negativo.
    await assert.rejects(
      servicio.procesarCheckout(usuarioId, [
        { productoId: productoAId, cantidad: 1 },
        { productoId: productoBId, cantidad: 5 },
      ]),
      StockInsuficienteError
    );

    const a = await prisma.producto.findUnique({ where: { id: productoAId } });
    const b = await prisma.producto.findUnique({ where: { id: productoBId } });
    assert.equal(a?.stock, 8, "el stock de A debe volver a su valor previo");
    assert.equal(b?.stock, 0, "el stock de B no debe cambiar");
    assert.equal(await prisma.pedido.count({ where: { usuarioId } }), pedidosAntes);
  });
}
