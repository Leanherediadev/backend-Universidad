# backend-universidad

Servidor HTTP básico construido con el módulo nativo `http` de Node.js y
TypeScript (Unidad 1 — Fundamentos del desarrollo backend).

## Instalación y ejecución

```bash
npm install
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

## Ejecutar los tests

```bash
npm test
```

## Endpoints

| Método | Ruta     | Descripción                                  |
|--------|----------|-----------------------------------------------|
| GET    | /salud   | Devuelve el estado del servidor              |
| GET    | /hora    | Devuelve la fecha/hora actual y la zona horaria |

Cualquier otra combinación de método/ruta responde `404 Not Found`.

## Endpoint nuevo: `GET /hora`

Se desarrolló siguiendo la técnica de **XP / TDD (red → green → refactor)**:

1. **RED** — se escribió `test/hora.test.ts` probando una función
   `obtenerHora()` que todavía no existía. La suite falló
   (`ERR_MODULE_NOT_FOUND`).
2. **GREEN** — se creó `src/endpoints/hora.ts` con el código mínimo
   necesario para que los 3 tests pasaran.
3. **RED** de nuevo — se escribió `test/manejador.test.ts` validando el
   ruteo HTTP de `/hora` (200, 404 para POST, 404 para rutas
   desconocidas) antes de conectarlo al enrutador.
4. **GREEN** — se creó `src/manejador.ts`, una función pura
   `manejarSolicitud(metodo, url)` que no depende de sockets HTTP reales,
   lo que permite testear el ruteo sin levantar un servidor.
5. **REFACTOR** — `src/servidor.ts` quedó como una capa delgada que solo
   traduce HTTP ⇄ `manejarSolicitud`, sin lógica propia que probar.

Esta separación (lógica pura testeable + servidor HTTP como adaptador
delgado) es la que permite escribir tests rápidos, sin red, siguiendo el
ciclo corto de XP.

## Casos de prueba con curl

```bash
# Endpoint nuevo
curl -i http://localhost:3000/hora
# Esperado: 200 OK
# {"fecha":"2026-08-25T00:20:26.925Z","zonaHoraria":"UTC"}

curl -i http://localhost:3000/salud
# Esperado: 200 OK

curl -i -X POST http://localhost:3000/hora
# Esperado: 404 Not Found (la ruta solo admite GET)

curl -i http://localhost:3000/ruta-inexistente
# Esperado: 404 Not Found
```

## Casos de prueba con Postman

1. Crear una request `GET` a `http://localhost:3000/hora`.
2. En la pestaña **Headers**, no es necesario agregar nada (no requiere
   autenticación).
3. Enviar y verificar:
   - Código de estado: `200 OK`.
   - Cuerpo: JSON con `fecha` (ISO 8601) y `zonaHoraria`.
4. Repetir la request cambiando el método a `POST` y verificar `404`.

## Estructura del proyecto

```
backend-universidad/
├── src/
│   ├── endpoints/
│   │   └── hora.ts       # lógica pura del nuevo endpoint
│   ├── manejador.ts       # enrutador puro (testeable sin HTTP real)
│   └── servidor.ts        # adaptador HTTP (createServer)
├── test/
│   ├── hora.test.ts
│   └── manejador.test.ts
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```
Enlace a documento de respaldo
https://docs.google.com/document/d/1j8PJ3m5TFJdXHQ9cDkgdXmlNNWfs9nEqQaZZoMB-zf8/edit?usp=sharing
