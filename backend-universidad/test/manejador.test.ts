import { test } from "node:test";
import assert from "node:assert/strict";
import { manejarSolicitud } from "../src/manejador.ts";

test("GET /salud responde 200 con estado ok", () => {
  const resultado = manejarSolicitud("GET", "/salud");
  assert.equal(resultado.status, 200);
  assert.equal(resultado.cuerpo.estado, "ok");
});

test("GET /hora responde 200 con fecha y zonaHoraria", () => {
  const resultado = manejarSolicitud("GET", "/hora");
  assert.equal(resultado.status, 200);
  assert.equal(typeof resultado.cuerpo.fecha, "string");
  assert.equal(typeof resultado.cuerpo.zonaHoraria, "string");
});

test("POST /hora responde 404 porque la ruta solo admite GET", () => {
  const resultado = manejarSolicitud("POST", "/hora");
  assert.equal(resultado.status, 404);
});

test("ruta inexistente responde 404", () => {
  const resultado = manejarSolicitud("GET", "/ruta-inexistente");
  assert.equal(resultado.status, 404);
  assert.equal(resultado.cuerpo.error, "Recurso no encontrado");
});
