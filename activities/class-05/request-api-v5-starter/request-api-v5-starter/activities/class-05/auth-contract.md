# Contrato de autenticación — Request API v5

Documenta ANTES de implementar. Para cada endpoint: método, ruta, ¿público o
protegido?, body permitido, respuesta de éxito (código + forma) y CADA error
(código HTTP + `error.code`).

## POST /auth/register

* Público. Body permitido (allowlist): `email`, `password`. Nada más.
* Normalización: `email` trim + lowercase antes de validar y de guardar.
* `password`: string de 15 a 128 caracteres (code points), Unicode y espacios
  permitidos. Jamás se registra en logs ni viaja en la respuesta.
* Éxito → `201`:
  `{ "id": "<uuid>", "email": "ana@example.com", "role": "requester", "createdAt": "<iso>" }`
* Errores:
  * Campo controlado por el servidor llegando en el body → `400 SERVER_CONTROLLED_FIELD`.
  * Email ausente / mal formado → `400 INVALID_EMAIL`.
  * Password ausente / fuera de 15..128 → `400 INVALID_PASSWORD`.
  * Email duplicado → `409 ACCOUNT_CANNOT_BE_CREATED` (genérico: no confirma
    que la cuenta exista).
  * Base inaccesible → `503 DATABASE_UNAVAILABLE`.

## POST /auth/login

* Público. Body: `email`, `password`.
* Éxito → `200`:
  `{ "accessToken": "<jwt>", "tokenType": "Bearer", "expiresIn": 3600 }`
* Errores:
  * Email inexistente, password incorrecta o cuenta no disponible →
    `401 INVALID_CREDENTIALS` con mensaje SIEMPRE idéntico
    («Email or password is incorrect.») y bytes iguales: la respuesta nunca
    dice qué dato falló.
  * Base inaccesible → `503 DATABASE_UNAVAILABLE`.

## GET /auth/me

* Protegido (requiere `Authorization: Bearer <token>`).
* Éxito → `200`: `{ "id": "<uuid>", "email": "…", "role": "requester" }`.
  Nunca expone password, hash, salt ni material de firma.
* Errores:
  * Header ausente o esquema que no es `Bearer ...` → `401 AUTHENTICATION_REQUIRED`.
  * Token inválido, alterado, vencido, con issuer/audience equivocados o firma
    de otra clave → `401 INVALID_TOKEN`.
  * El token no corresponde a una cuenta existente → `401 INVALID_TOKEN`.

## JWT del taller

Claims: `sub` (id del usuario), `role`, `iat`, `exp` (iat + 1 hora),
`iss = backend-course-api`, `aud = backend-course-client`. Firma `HS256` con
`JWT_SECRET`. El token está firmado, NO cifrado: no lleva datos sensibles.

## Semántica de errores

Criterio, no ejemplos:

* `400` — el cliente rompió el contrato: body con campos prohibidos
  (SERVER_CONTROLLED_FIELD), email o password inválidos, fields no
  actualizables.
* `401` — NO hay identidad confiable: sin token, esquema que no es Bearer,
  token que no verifica, o credenciales de login incorrectas. En login el
  mensaje es idéntico para no permitir enumerar cuentas.
* `403` — HAY identidad confiable (req.auth existe) pero esa operación está
  prohibida para ese actor: ejemplo, un `requester` cambiando prioridad, un
  `agent` creando solicitudes o editando contenido.
* `404` — el recurso no existe O el actor no tiene derecho a verlo (ajeno o
  heredado sin dueño): se responde idéntico a propósito, para no revelar
  existencia.
* `409` — conflicto con el estado actual: email duplicado, transición de
  estado inválida o solicitud en estado terminal.