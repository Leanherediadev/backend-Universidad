import { readFileSync } from "node:fs";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";
import { obtenerHora } from "./endpoints/hora.ts";
import type { PedidoController } from "./controllers/pedido.controller.ts";
import { crearRouterPedidos } from "./routes/pedidos.routes.ts";

function cargarDocumentacion() {
  const ruta = new URL("./docs/openapi.yaml", import.meta.url);
  return parse(readFileSync(ruta, "utf-8"));
}

// Crea la aplicación Express (sin hacer listen) para poder testearla.
export function crearApp(pedidoController: PedidoController) {
  const app = express();

  app.use(express.json());

  // Documentación interactiva (Swagger UI)
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(cargarDocumentacion()));

  // Endpoints de las unidades anteriores
  app.get("/salud", (_req, res) => {
    res.json({ estado: "ok", fecha: new Date().toISOString() });
  });
  app.get("/hora", (_req, res) => {
    res.json(obtenerHora());
  });

  // Unidad 3
  app.use("/api/pedidos", crearRouterPedidos(pedidoController));

  app.use((_req, res) => {
    res.status(404).json({ error: "Recurso no encontrado" });
  });

  // JSON mal formado, errores inesperados, etc.
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (error as { status?: number }).status;
    if (status === 400) {
      res.status(400).json({ error: "JSON inválido en el cuerpo de la petición" });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  });

  return app;
}
