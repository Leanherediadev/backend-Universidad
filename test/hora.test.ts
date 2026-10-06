import { test } from "node:test";
import assert from "node:assert/strict";
import { obtenerHora } from "../src/endpoints/hora.ts";

test("obtenerHora devuelve un objeto con fecha en formato ISO 8601", () => {
  const resultado = obtenerHora();

  assert.equal(typeof resultado.fecha, "string");
  // Formato ISO 8601: 2026-08-24T12:34:56.789Z
  assert.match(
    resultado.fecha,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
  );
});

test("obtenerHora devuelve una fecha válida y cercana al momento actual", () => {
  const antes = Date.now();
  const resultado = obtenerHora();
  const despues = Date.now();

  const fechaObtenida = new Date(resultado.fecha).getTime();

  assert.ok(fechaObtenida >= antes && fechaObtenida <= despues);
});

test("obtenerHora incluye el campo zonaHoraria", () => {
  const resultado = obtenerHora();
  assert.equal(typeof resultado.zonaHoraria, "string");
  assert.ok(resultado.zonaHoraria.length > 0);
});
