import type { ProductoComprado } from "../services/pedido.service.ts";

export interface DatosCheckout {
  usuarioId: number;
  productosComprados: ProductoComprado[];
}

export type ResultadoValidacion =
  | { valido: true; datos: DatosCheckout }
  | { valido: false; errores: string[] };

function esEnteroPositivo(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isInteger(valor) && valor > 0;
}

// Función pura: valida el cuerpo JSON del POST /api/pedidos.
export function validarCheckout(cuerpo: unknown): ResultadoValidacion {
  const errores: string[] = [];

  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return { valido: false, errores: ["El cuerpo debe ser un objeto JSON"] };
  }

  const { usuarioId, productosComprados } = cuerpo as Record<string, unknown>;

  if (!esEnteroPositivo(usuarioId)) {
    errores.push("usuarioId es obligatorio y debe ser un entero positivo");
  }

  if (!Array.isArray(productosComprados) || productosComprados.length === 0) {
    errores.push("productosComprados es obligatorio y debe ser un arreglo no vacío");
  } else {
    productosComprados.forEach((item, indice) => {
      const fila = (item ?? {}) as Record<string, unknown>;
      if (!esEnteroPositivo(fila.productoId)) {
        errores.push(`productosComprados[${indice}].productoId debe ser un entero positivo`);
      }
      if (!esEnteroPositivo(fila.cantidad)) {
        errores.push(`productosComprados[${indice}].cantidad debe ser un entero positivo`);
      }
    });
  }

  if (errores.length > 0) {
    return { valido: false, errores };
  }

  return {
    valido: true,
    datos: {
      usuarioId: usuarioId as number,
      productosComprados: (productosComprados as ProductoComprado[]).map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      })),
    },
  };
}
