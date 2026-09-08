# Matriz de acceso — Request API v5

Dos roles exactos: `requester` y `agent`. Sin `admin`.

Completa cada celda con `Sí`, `No`, `Propias` o `Propia y abierta`.
La matriz puede discutirse, pero la implementación converge en la baseline
fija del taller (la lámina "Contrato fijo").

| Operación | Anónimo | Requester | Agent |
| --------- | ------: | --------: | ----: |
| `POST /auth/register` | Sí | Sí | Sí |
| `POST /auth/login` | Sí | Sí | Sí |
| `GET /auth/me` | No | Sí | Sí |
| `GET /requests` | No | Propias | Todas |
| `GET /requests/:id` | No | Propia | Todas |
| `GET /requests/:id/history` | No | Propia | Todas |
| `POST /requests` | No | Sí | No |
| Editar título/descripción | No | Propia y abierta | No |
| Cambiar prioridad | No | No | Sí |
| Cambiar estado | No | No | Sí |

## Campos controlados por el servidor

El cliente JAMÁS puede enviar estos campos; intentarlo responde
`400 SERVER_CONTROLLED_FIELD` (rechazo explícito, nunca ignorarlo):

| Contexto | Campos | Respuesta exacta |
| -------- | ------ | ---------------- |
| `POST /auth/register` | `role`, `id`, `createdAt`, `updatedAt`, `createdBy`, `passwordHash` | `400 { "error": { "code": "SERVER_CONTROLLED_FIELD", ... } }` |
| `POST /requests` | `id`, `createdBy`, `createdAt`, `updatedAt`, `changedBy`, `status` | `400 SERVER_CONTROLLED_FIELD` |
| `PATCH /requests/:id` | `id`, `createdBy`, `createdAt`, `updatedAt`, `changedBy` | `400 SERVER_CONTROLLED_FIELD` |

`createdBy` y `changedBy` salen siempre del token verificado (`req.auth`),
nunca del body.

## Solicitudes heredadas

Las solicitudes sin propietario (`created_by IS NULL`, creadas antes de la
clase 05) las ve SOLO el `agent`.

Motivo: la propiedad se deriva de una persona autenticada; un `requester`
nunca puede ser dueño de algo que no creó, y devolverle esas filas filtraría
información de una "cuenta" que no existe. El `agent` las atendió y su
panel necesita verlas para completarlas.