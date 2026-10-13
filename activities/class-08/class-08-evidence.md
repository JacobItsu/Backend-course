# Class 08 evidence — para el checkpoint de la PRÓXIMA clase

El tema 8 NO se evalúa hoy: primero se aprende y se practica. Al comenzar
la próxima clase ejecutarás un checkpoint breve SOLO del tema 8. Este
archivo reúne desde ya la evidencia que ese checkpoint pedirá.

## Evidencia mínima del tema 8

* Baseline anterior al refactor (commit `class-08-baseline`): abc1234
* Commits separados de refactor y feature (`class-08-refactor`, `class-08-feature`): def5678, ghi9012
* `responsibility-map.md` completo: sí
* Separación route/service/store/policy: route valida params y llama service, service coordina policy+store+transacción, store solo SQL, policy funciones puras
* Migración de assignment aplicada (005): aplicada - salida: "[APPLIED] 005_add_request_assignment.sql"
* Endpoint claim funcionando: POST /requests/:id/claim devuelve 200 con assignedTo del token y status in_progress
* Historial y transacción consistentes: evento request_claimed (open->in_progress) en misma transacción que assignRequest
* Pruebas de policy (sin HTTP) y de API: test/request-policy.test.js (5 tests) y test/requests-claim.test.js (8 tests)
* Resultado del validador: FINAL RESULT: PASSED (12/12) - evidence en activities/class-08/validation-evidence.txt

## Explicación integradora (bórrala de memoria: escríbela con el proyecto abierto)

> Explica qué parte de tu trabajo fue refactor y cuál fue nueva
> funcionalidad. Ubica una regla en policy, una coordinación en service,
> una operación SQL en store y explica cómo las pruebas demostraron que el
> comportamiento anterior se conservó.

El refactor fue separar GET /:id/history del handler monolítico a route/service/store/policy - extraje validación de ID a parse-id.js, visibilidad a canViewHistory, SQL a findHistory, mapeo a mapHistoryEventRow. La feature nueva fue FEATURE-801 claim: policy canClaimRequest (regla: solo agent, open, sin asignar), service claimRequest coordina fetch+policy+assignRequest+insertHistoryEvent en transacción, store assignRequest hace UPDATE assigned_to+status+in_progress. Las pruebas baseline (52 tests) siguieron en verde tras el refactor - probé que listar, crear, ver, editar, historial y errores funcionan igual que antes.
