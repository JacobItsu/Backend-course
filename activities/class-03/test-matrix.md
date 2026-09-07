# Test matrix — Entrega 03

> Fase 1: se declara el resultado **esperado**. Fase 5: se ejecuta cada caso con `curl`
> contra el proyecto corriendo y se registra el resultado **observado** (línea de estado
> literal y cuerpo). La columna observado se llena ejecutando, no copiando la esperada.
>
> Código de hoy: **10/10 ✅** — re-ejecutado contra `activities/class-03/project/`
> (node src/server.js) con `curl.exe -i`.

## Casos obligatorios

| Caso                   | Petición                      | Estado previo | Resultado esperado                    | Resultado observado |
| ---------------------- | ----------------------------- | ------------- | ------------------------------------- | ------------------- |
| Crear correctamente    | `POST /requests`              | —             | `201`                                 | `201` `{"id":4,"title":"Broken projector cable","status":"open","priority":"high",...}` |
| Crear sin título       | `POST /requests`              | —             | `400` (VALIDATION_ERROR)              | `400` `{"error":{"code":"VALIDATION_ERROR","message":"Title is required"}}` |
| Consultar inexistente  | `GET /requests/999`           | —             | `404` (NOT_FOUND)                     | `404` `{"error":{"code":"NOT_FOUND","message":"Request not found"}}` |
| Filtrar sin resultados | `GET /requests?status=closed` | —             | `200 []`                              | `200` `[]` |
| Cambiar prioridad      | `PATCH /requests/1`           | `open`        | `200` (priority cambia)               | `200` `priority` pasa a `low`, `updatedAt` se renueva |
| Transición válida      | `PATCH /requests/1`           | `open`        | `200` (status pasa a `in_progress`)   | `200` `status` pasa a `in_progress` |
| Transición inválida    | `PATCH /requests/1`           | `in_progress` | `409` (INVALID_STATUS_TRANSITION)     | `409` `{"error":{"code":"INVALID_STATUS_TRANSITION","message":"Transition from 'in_progress' to 'open' is not allowed"}}` |
| Modificar cerrada      | `PATCH /requests/1`           | `closed`      | `409` (REQUEST_IN_TERMINAL_STATUS)    | `409` `{"error":{"code":"REQUEST_IN_TERMINAL_STATUS","message":"Request is in terminal status 'closed' and cannot be modified"}}` |

## Casos propios

| Caso                                   | Petición                             | Estado previo | Resultado esperado                                  | Resultado observado |
| -------------------------------------- | ------------------------------------ | ------------- | --------------------------------------------------- | ------------------- |
| Filtrar con valor inválido             | `GET /requests?priority=super_high`  | —             | `400` (INVALID_FILTER_VALUE)                        | `400` `{"error":{"code":"INVALID_FILTER_VALUE","message":"Unknown priority value 'super_high'"}}` |
| PATCH solo con campos del servidor     | `PATCH /requests/3`                  | `open`        | `400` (VALIDATION_ERROR: sin campos modificables)   | `400` `{"error":{"code":"VALIDATION_ERROR","message":"No modifiable fields provided"}}` |

## Evidencia

Salidas reales de `curl -i` capturadas en la fase 5 contra `activities/class-03/project/`
(`node src/server.js`). Se incluye, además de los dos casos que prueban las reglas protegidas
(409), muestras de los errores 404 y 400 de filtro.

```txt
--- Transición inválida: PATCH /requests/1 {"status":"open"} (req en in_progress) ---
HTTP/1.1 409 Conflict
{"error":{"code":"INVALID_STATUS_TRANSITION","message":"Transition from 'in_progress' to 'open' is not allowed"}}

--- Solicitud terminal: PATCH /requests/1 {"priority":"low"} (req en closed) ---
HTTP/1.1 409 Conflict
{"error":{"code":"REQUEST_IN_TERMINAL_STATUS","message":"Request is in terminal status 'closed' and cannot be modified"}}

--- Consultar inexistente: GET /requests/999 ---
HTTP/1.1 404 Not Found
{"error":{"code":"NOT_FOUND","message":"Request not found"}}

--- Filtro con valor inválido: GET /requests?priority=super_high ---
HTTP/1.1 400 Bad Request
{"error":{"code":"INVALID_FILTER_VALUE","message":"Unknown priority value 'super_high'"}}
```

> Nota de reproducción: el store de la clase 03 es en memoria. Para reproducir los casos 5–8
> sobre la misma solicitud hay que respetar el orden: cambiar prioridad (open) → avanzar a
> `in_progress` → intentar volver a `open` (409) → llevar a `resolved` → `closed` → intentar
> modificar (409).
