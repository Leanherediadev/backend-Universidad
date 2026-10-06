import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { crearApp } from "../src/app.ts";
import { PedidoController } from "../src/controllers/pedido.controller.ts";
import {
  ProductoNoEncontradoError,
  StockInsuficienteError,
  UsuarioNoEncontradoError,
} from "../src/errors/errores.ts";

// Servicio falso: permite probar el controller y las rutas sin base de datos.
let comportamiento: () => Promise<unknown> = async () => ({ id: 1 });
const servicioFalso = {
  procesarCheckout: () => comportamiento(),
} as never;

let servidor: Server;
let base = "";

before(async () => {
  const app = crearApp(new PedidoController(servicioFalso));
  servidor = app.listen(0);
  await new Promise((r) => servidor.once("listening", r));
  base = `http://localhost:${(servidor.address() as AddressInfo).port}`;
});

after(() => {
  servidor.close();
  servidor.closeAllConnections();
});

function postPedido(cuerpo: unknown) {
  return fetch(`${base}/api/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  });
}

const cuerpoValido = { usuarioId: 1, productosComprados: [{ productoId: 1, cantidad: 1 }] };

test("GET /salud responde 200 con estado ok", async () => {
  const r = await fetch(`${base}/salud`);
  assert.equal(r.status, 200);
  assert.equal(((await r.json()) as { estado: string }).estado, "ok");
});

test("GET /hora responde 200 con fecha y zonaHoraria", async () => {
  const r = await fetch(`${base}/hora`);
  const cuerpo = (await r.json()) as { fecha: string; zonaHoraria: string };
  assert.equal(r.status, 200);
  assert.equal(typeof cuerpo.fecha, "string");
  assert.equal(typeof cuerpo.zonaHoraria, "string");
});

test("ruta inexistente responde 404", async () => {
  const r = await fetch(`${base}/ruta-inexistente`);
  assert.equal(r.status, 404);
});

test("POST /api/pedidos con datos válidos responde 201 y el pedido", async () => {
  comportamiento = async () => ({ id: 7, total: "10" });
  const r = await postPedido(cuerpoValido);
  assert.equal(r.status, 201);
  assert.deepEqual(await r.json(), { id: 7, total: "10" });
});

test("POST /api/pedidos con datos incompletos responde 400", async () => {
  const r = await postPedido({ productosComprados: [] });
  assert.equal(r.status, 400);
});

test("POST /api/pedidos con JSON mal formado responde 400", async () => {
  const r = await postPedido("{oops");
  assert.equal(r.status, 400);
});

test("POST /api/pedidos sin stock responde 400", async () => {
  comportamiento = async () => {
    throw new StockInsuficienteError(1, "Cuaderno");
  };
  const r = await postPedido(cuerpoValido);
  assert.equal(r.status, 400);
});

test("POST /api/pedidos con usuario o producto inexistente responde 422", async () => {
  comportamiento = async () => {
    throw new UsuarioNoEncontradoError(1);
  };
  assert.equal((await postPedido(cuerpoValido)).status, 422);

  comportamiento = async () => {
    throw new ProductoNoEncontradoError(1);
  };
  assert.equal((await postPedido(cuerpoValido)).status, 422);
});

test("POST /api/pedidos con error inesperado responde 500", async () => {
  comportamiento = async () => {
    throw new Error("boom");
  };
  const original = console.error;
  console.error = () => {};
  const r = await postPedido(cuerpoValido);
  console.error = original;
  assert.equal(r.status, 500);
});

test("GET /api-docs sirve Swagger UI", async () => {
  const r = await fetch(`${base}/api-docs/`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /swagger/i);
});
