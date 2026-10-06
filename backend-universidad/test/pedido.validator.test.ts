import { test } from "node:test";
import assert from "node:assert/strict";
import { validarCheckout } from "../src/validators/pedido.validator.ts";

test("acepta un cuerpo completo y válido", () => {
  const r = validarCheckout({
    usuarioId: 1,
    productosComprados: [{ productoId: 2, cantidad: 3 }],
  });
  assert.equal(r.valido, true);
  if (r.valido) {
    assert.equal(r.datos.usuarioId, 1);
    assert.deepEqual(r.datos.productosComprados, [{ productoId: 2, cantidad: 3 }]);
  }
});

test("rechaza cuerpo que no es un objeto", () => {
  assert.equal(validarCheckout(undefined).valido, false);
  assert.equal(validarCheckout([]).valido, false);
});

test("rechaza si falta usuarioId", () => {
  const r = validarCheckout({ productosComprados: [{ productoId: 1, cantidad: 1 }] });
  assert.equal(r.valido, false);
});

test("rechaza productosComprados vacío o ausente", () => {
  assert.equal(validarCheckout({ usuarioId: 1, productosComprados: [] }).valido, false);
  assert.equal(validarCheckout({ usuarioId: 1 }).valido, false);
});

test("rechaza cantidades inválidas (0, negativa, decimal, texto)", () => {
  for (const cantidad of [0, -1, 1.5, "2"]) {
    const r = validarCheckout({
      usuarioId: 1,
      productosComprados: [{ productoId: 1, cantidad }],
    });
    assert.equal(r.valido, false, `cantidad ${String(cantidad)} debería ser inválida`);
  }
});
