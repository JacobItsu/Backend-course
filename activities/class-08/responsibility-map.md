# Responsibility map — Clase 08

Mapa de responsabilidades del handler cargado ANTES de refactorizar.
Complétalo mientras lees `GET /:id/history` en `requests.routes.js`.

## El handler analizado

Ruta/operación: `GET /requests/:id/history`

## Clasificación de bloques

Para cada bloque del handler, anota a qué categoría pertenece y qué líneas
lo forman (aprox.):

| Categoría | ¿Qué hace ese bloque aquí? | ¿A qué archivo debería moverse? |
| --- | --- | --- |
| HTTP (leer params/identidad) | parseIdParam(req.params.id), req.auth del middleware authenticate | requests.routes.js (se queda) |
| Aplicación (coordinar el caso) | Llama getRequest para validar existencia/visibilidad, luego findHistory | requests.service.js (getRequestHistory) |
| Negocio (¿puede verse?) | canViewRequest(actor, request) - decide si requester ve solo suyo | request.policy.js (canViewHistory) |
| Persistencia (SQL) | SELECT * FROM request_history WHERE request_id = $1 ORDER BY created_at, id | requests.store.js (findHistory) |
| Presentación (construir respuesta) | mapHistoryEventRow transforma snake_case a camelCase, filtra campos por tipo | request.mapper.js (mapHistoryEventRow) |
| Observabilidad (errores/requestId) | requestId ya viene en req.requestId, errores via AppError al error-handler | middleware/request-id.js, middleware/error-handler.js |

## Las preguntas del análisis

* ¿Cuántas RAZONES distintas tiene esta función para cambiar?

  6 razones: cambios en validación de ID, cambios en reglas de visibilidad, cambios en SQL/historia, cambios en formato de respuesta, cambios en logging/requestId, cambios en manejo de errores.

* ¿Qué piezas ya existentes del proyecto duplica? (pista: mira store, mapper y policy)

  Duplica findById (ya existe en store), canViewRequest (ya existe en policy), mapHistoryEventRow (ya existe en mapper), manejo de errores 404/403 (ya en service).

* ¿Qué NO se puede probar de forma aislada mientras todo viva junto?

  La policy de visibilidad (canViewRequest) no se puede testear sin HTTP ni DB porque está acoplada al handler. El SQL no se puede testear sin levantar base de datos. El mapeo no se puede testear sin datos reales de la query.
