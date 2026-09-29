import { createServer } from "node:http";
import { manejarSolicitud } from "./manejador.ts";

const puerto = Number(process.env.PORT ?? 3000);

const servidor = createServer((solicitud, respuesta) => {
  respuesta.setHeader("Content-Type", "application/json; charset=utf-8");

  const { status, cuerpo } = manejarSolicitud(
    solicitud.method,
    solicitud.url
  );

  respuesta.writeHead(status);
  respuesta.end(JSON.stringify(cuerpo));
});

servidor.listen(puerto, () => {
  console.log(`Servidor disponible en http://localhost:${puerto}`);
});
