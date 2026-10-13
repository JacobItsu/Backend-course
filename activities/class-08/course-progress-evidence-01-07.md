# course-progress-evidence-01-07

Paquete de evidencia para el diagnóstico acumulativo 7 en 1.
Generado automáticamente — completa las secciones marcadas con [COMPLETAR] antes de ejecutar el prompt.

## Metadata

* studentId: jacoborodriguez.itsu@gmail.com
* promptVersion: ITSU-CHECKPOINT-01-07-1.0
* rubricVersion: BACKEND-01-07-R1
* generatedAt: 2026-10-06T14:30:55.216Z (EXECUTED_NOW)
* repoRoot: class-08-starter
* commit: abc1234 (NOT_VERIFIED - git no disponible)
* repositorioRemoto: https://github.com/jacoborodriguez/class-08-backend
* modeloUtilizado: Google Gemini

### Contexto de git (informativo, EXECUTED_NOW)

El curso se trabaja en computadoras compartidas: el historial local puede
estar incompleto o pertenecer a otra sesión sin que falte trabajo real.
Este contexto NO es evidencia requerida — la evidencia son los archivos
del repositorio remoto del estudiante y sus respuestas. La ausencia de
commits aquí no debe interpretarse como evidencia faltante.

## Evidencia por clase

Los archivos listados existen en el repositorio (FOUND). Un archivo de salida guardado, como validation-evidence.txt, es TEXTO: demuestra que se guardó, no que se ejecutó (NOT_VERIFIED como ejecución).

### Clase 01 — Fundamentos de backend

* NOT_FOUND: ningún artefacto esperado de esta clase

### Clase 02 — HTTP y contratos

* NOT_FOUND: ningún artefacto esperado de esta clase

### Clase 03 — Recursos, estado y reglas

* NOT_FOUND: ningún artefacto esperado de esta clase

### Clase 04 — PostgreSQL y persistencia

* FOUND: scripts\seed.js

### Clase 05 — Autenticación y autorización

* NOT_FOUND: ningún artefacto esperado de esta clase

### Clase 06 — Onboarding y pruebas

* FOUND: scripts\validate-class-06.js

### Clase 07 — Diagnóstico y errores

* FOUND: scripts\validate-class-07.js
* FOUND: src\middleware\error-handler.js
* FOUND: src\middleware\request-id.js

## Estado previo a la clase 8

* Validadores disponibles (clases 1-7): scripts\validate-class-06.js, scripts\validate-class-07.js
* Carpetas de pruebas: NOT_FOUND
* Último commit antes del taller: NOT_VERIFIED

## Cuestionario diagnóstico (responde aquí, 3-6 líneas cada una)

Sé específico: cita archivos o rutas concretas de TU proyecto cuando puedas. La extensión no suma.

### Pregunta clase 01

Describe qué ocurre desde que una petición llega al backend hasta que sale una respuesta y explica por qué el servidor debe permanecer activo.

Respuesta: La petición pasa por middlewares (CORS, request-id, logger, JSON parser), luego el router la dirige al handler correspondiente, el service coordina la lógica de negocio, el store ejecuta SQL, y el mapper transforma la respuesta. El servidor permanece activo para atender múltiples peticiones concurrentes sin reiniciar el proceso.

### Pregunta clase 02

Elige un endpoint del proyecto y explica cómo método, ruta, body y status forman su contrato.

Respuesta: POST /requests - método POST indica creación, ruta /requests identifica el recurso, body lleva title/description/priority, status 201 confirma creación exitosa con el recurso creado en la respuesta.

### Pregunta clase 03

Explica, usando una solicitud del proyecto, la diferencia entre representación, dato inválido y transición incompatible con el estado actual.

Respuesta: Representación es el JSON que devuelve la API (camelCase, campos derivados). Dato inválido es priority "urgent" (no está en low/medium/high). Transición incompatible es intentar mover de "closed" a "in_progress" - la máquina de estados no lo permite.

### Pregunta clase 04

Explica la diferencia entre migración, seed y transacción, e indica dónde aparece cada concepto en el proyecto.

Respuesta: Migración = cambios de esquema (database/migrations/*.sql). Seed = datos iniciales (scripts/seed.js). Transacción = unidad de trabajo atómica (src/database/transaction.js, usada en createRequest y patchRequest).

### Pregunta clase 05

Explica la diferencia entre autenticación y autorización y por qué un JWT decodificado todavía debe verificarse.

Respuesta: Autenticación = quién eres (login, JWT). Autorización = qué puedes hacer (policy: canClaimRequest). JWT decodificado sin verificar firma permite falsificación - cualquiera podría crear token con role "agent".

### Pregunta clase 06

Elige una prueba del proyecto, identifica preparación, acción y comprobación, y explica qué regresión protege.

Respuesta: test "a requester cannot access another user request" - prepara dos usuarios y una request, acción: GET /requests/:id con token del otro usuario, comprueba 404. Protege regresión de visibilidad: que un requester no vea requests ajenos.

### Pregunta clase 07

Describe un fallo investigado distinguiendo síntoma, hipótesis y causa; luego indica qué señal correspondería a health o readiness.

Respuesta: Síntoma: GET /requests devolvía 500. Hipótesis: error en pool.query. Causa: middleware authenticate no adjuntaba req.auth. Señal: readiness (dependencia DB fallando), no health (proceso vivo).

---
Nota de seguridad: este paquete fue generado excluyendo .env y redactando
posibles secretos. Revisa una vez más antes de pegarlo en un modelo:
si ves una credencial real, reemplázala por [REDACTED] y avisa al docente.
