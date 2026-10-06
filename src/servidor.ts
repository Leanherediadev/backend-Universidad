import { prisma } from "./config/prisma.ts";
import { crearApp } from "./app.ts";
import { DetallePedidoRepository } from "./repositories/detallePedido.repository.ts";
import { PedidoRepository } from "./repositories/pedido.repository.ts";
import { ProductoRepository } from "./repositories/producto.repository.ts";
import { UsuarioRepository } from "./repositories/usuario.repository.ts";
import { PedidoService } from "./services/pedido.service.ts";
import { PedidoController } from "./controllers/pedido.controller.ts";

// Composición de dependencias: Prisma -> Repositories -> Service -> Controller
const repos = {
  usuarios: new UsuarioRepository(prisma),
  productos: new ProductoRepository(prisma),
  pedidos: new PedidoRepository(prisma),
  detalles: new DetallePedidoRepository(prisma),
};
const servicio = new PedidoService(prisma, repos);
const controlador = new PedidoController(servicio);

const app = crearApp(controlador);
const puerto = Number(process.env.PORT ?? 3000);

const servidor = app.listen(puerto, () => {
  console.log(`Servidor disponible en http://localhost:${puerto}`);
  console.log(`Documentación Swagger en http://localhost:${puerto}/api-docs`);
});

async function cerrar() {
  servidor.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGINT", cerrar);
process.on("SIGTERM", cerrar);
