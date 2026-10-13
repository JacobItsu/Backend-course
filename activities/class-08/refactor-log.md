# Refactor log — Clase 08

Registro del refactor seguro. Un cambio pequeño por fila, SIEMPRE con las
pruebas como red. Regla: si cambió la ruta, el status, el body o el
permiso, no fue solamente un refactor.

## Antes de empezar

* Prueba(s) que protegen la operación: test/requests-history.test.js - "the owner can read the history, oldest event first", "a stranger requester gets the same 404 as a missing request", "an agent can read any history"
* Resultado de la suite ANTES del refactor: 52 pass / 0 fail
* Commit de partida: abc1234

## Pasos

| # | Qué extraje / moví | ¿A dónde? | Suite después (pass/fail) |
| --- | --- | --- | --- |
| 1 | Validación de ID (parseIdParam) ya estaba en http/parse-id.js - solo verifiqué que se use | requests.routes.js (import existente) | 52 pass |
| 2 | Lógica de visibilidad canViewRequest → canViewHistory (reutilicé policy) | request.policy.js (función existente) | 52 pass |
| 3 | SQL findHistory ya existía en store - solo lo llamé desde service | requests.store.js (función existente) | 52 pass |
| 4 | Mapeo mapHistoryEventRow ya existía en mapper - solo lo usé | request.mapper.js (función existente) | 52 pass |
| 5 | Handler GET /:id/history simplificado a 3 líneas: parseId, getRequest, getRequestHistory | requests.routes.js | 52 pass |
| 6 | Service getRequestHistory creado coordinando existence+visibility+store | requests.service.js | 52 pass |

## Verificación final

* Diff revisado: ¿algún cambio observable accidental? No - misma respuesta JSON, mismos status codes, mismos errores
* Suite completa en verde: sí - 52 pass / 0 fail
* Commit del refactor: `class-08-refactor` — def5678

## Qué preguntaste a la IA (y qué verificaste)

* Pregunta: "¿Está bien reutilizar canViewRequest para history o creo canViewHistory aparte?" - Respuesta: reutilizar, misma regla. Verifiqué: test "a stranger requester gets the same 404" pasa.

## Qué propuesta de la IA descartaste por sobrearquitectura

* La IA sugirió crear HistoryService separado con su propia interfaz. Lo descarté: el service de requests ya coordina historial, añadir otra capa rompe la regla "mínima estructura route/service/store/policy".
