import { obtenerHora } from "./endpoints/hora.ts";

export interface ResultadoSolicitud {
  status: number;
  cuerpo: Record<string, unknown>;
}

export function manejarSolicitud(
  metodo: string | undefined,
  url: string | undefined
): ResultadoSolicitud {
  if (metodo === "GET" && url === "/salud") {
    return {
      status: 200,
      cuerpo: { estado: "ok", fecha: new Date().toISOString() },
    };
  }

  if (metodo === "GET" && url === "/hora") {
    return {
      status: 200,
      cuerpo: { ...obtenerHora() },
    };
  }

  return {
    status: 404,
    cuerpo: { error: "Recurso no encontrado" },
  };
}
