# backend-universidad

API REST en Node.js + TypeScript con **Express**, **Prisma ORM** y
**PostgreSQL**, documentada con **OpenAPI / Swagger UI**
(Unidad 3 — Persistencia y documentación del contrato).

## Arquitectura por capas

```
Request → Route → Controller → Service → Repository → Prisma → PostgreSQL
```

| Capa         | Carpeta               | Responsabilidad                                         |
|--------------|-----------------------|---------------------------------------------------------|
| Rutas        | `src/routes`          | Router de Express, expone `POST /api/pedidos`           |
| Controller   | `src/controllers`     | Valida la entrada y traduce errores a códigos HTTP      |
| Service      | `src/services`        | Reglas de negocio y transacción de checkout             |
| Repository   | `src/repositories`    | Acceso a datos con el cliente de Prisma (CRUD)          |
| Config       | `src/config/prisma.ts`| Única instancia de `PrismaClient`                       |
| Contrato     | `src/docs/openapi.yaml`| Especificación OpenAPI 3.2.0                           |

## Requisitos

- Node.js 22.9 o superior
- PostgreSQL en ejecución (local o Docker)

## Puesta en marcha

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
cp .env.example .env        # editá DATABASE_URL con tu usuario/clave/base

# 3. Crear la base (si no existe) y aplicar las migraciones
npx prisma migrate dev      # crea las tablas y genera el cliente de Prisma

# 4. Datos de prueba (1 usuario y 3 productos)
npm run prisma:seed

# 5. Levantar el servidor
npm run dev
```

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`

Si clonás el repo en otra máquina y ya existen las migraciones, usá
`npx prisma migrate deploy` y luego `npx prisma generate`.

## Modelo de datos

`Usuario 1—N Pedido 1—N DetallePedido N—1 Producto`

Definido en `prisma/schema.prisma`. Los importes (`precio`, `total`,
`precioUnitario`) son `Decimal` y se serializan como texto en el JSON.

## Endpoint: `POST /api/pedidos`

Cuerpo:

```json
{
  "usuarioId": 1,
  "productosComprados": [
    { "productoId": 1, "cantidad": 2 },
    { "productoId": 2, "cantidad": 1 }
  ]
}
```

| Código | Cuándo                                                            |
|--------|-------------------------------------------------------------------|
| 201    | Pedido creado; devuelve el pedido con sus detalles                |
| 400    | Datos incompletos/inválidos, JSON mal formado o stock insuficiente|
| 422    | El usuario o algún producto no existe                             |
| 500    | Error inesperado                                                  |

### Transacción de checkout (ACID)

`PedidoService.procesarCheckout` usa `prisma.$transaction`:

1. Crea el `Pedido` asociado al usuario.
2. Por cada producto resta `stock`; si queda **negativo** lanza
   `StockInsuficienteError` → **ROLLBACK** (no queda ningún cambio).
3. Crea cada `DetallePedido` y acumula el total.
4. Actualiza el `Pedido` con el total → **COMMIT**.

## Pruebas con curl

```bash
# 201
curl -i -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":1,"productosComprados":[{"productoId":1,"cantidad":2}]}'

# 400 (stock insuficiente: la Mochila tiene stock 3)
curl -i -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":1,"productosComprados":[{"productoId":3,"cantidad":99}]}'

# 400 (datos incompletos)
curl -i -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" -d '{"productosComprados":[]}'
```

## Tests

```bash
npm test          # unitarios (sin base de datos); el de integración se omite
npm run test:db   # integración contra PostgreSQL real (usa DATABASE_URL del .env)
```

El test de integración crea sus propios datos y los elimina al terminar; verifica
tanto el checkout exitoso como el ROLLBACK cuando falta stock.

## Scripts

| Script                | Acción                                      |
|-----------------------|---------------------------------------------|
| `npm run dev`         | Servidor en desarrollo (Node con strip-types)|
| `npm run build`       | Compila a `dist/` y copia el YAML de OpenAPI |
| `npm start`           | Ejecuta la versión compilada                 |
| `npm run prisma:migrate` | `prisma migrate dev`                      |
| `npm run prisma:seed` | Carga datos de prueba                        |
| `npm run prisma:studio` | Explorador visual de la base               |

## Otros endpoints (unidades anteriores)

| Método | Ruta     | Descripción                                     |
|--------|----------|--------------------------------------------------|
| GET    | /salud   | Estado del servidor                              |
| GET    | /hora    | Fecha/hora actual y zona horaria                 |

## Estructura

```
backend-universidad/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── prisma.config.ts
├── src/
│   ├── config/prisma.ts
│   ├── controllers/pedido.controller.ts
│   ├── docs/openapi.yaml
│   ├── endpoints/hora.ts
│   ├── errors/errores.ts
│   ├── repositories/
│   ├── routes/pedidos.routes.ts
│   ├── services/pedido.service.ts
│   ├── validators/pedido.validator.ts
│   ├── app.ts
│   └── servidor.ts
├── test/
├── .env.example
└── package.json
```
