import { Router } from "express";
import type { PedidoController } from "../controllers/pedido.controller.ts";

export function crearRouterPedidos(controlador: PedidoController): Router {
  const router = Router();
  router.post("/", controlador.crear);
  return router;
}
