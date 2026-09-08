# AI usage

Este archivo solo puede tener contenido DESPUÉS del checkpoint
`class-05-access-design` (matriz + contrato + amenazas completos).

## My design before AI

Antes de tocar código completé, en orden:
1. `access-matrix.md`: la tabla operación × rol con la baseline del taller
   (registro/login públicos para todos; `/requests` protegidos; requester ve
   Propias, agent ve Todas; edit de contenido = Propia y abierta; prioridad y
   estado = solo agent). Sin placeholders.
2. `auth-contract.md`: los tres endpoints de auth con body, respuestas de
   éxito (201/200) y la semántica de errores 400/401/403/404/409 +
   `INVALID_CREDENTIALS` genérico.
3. `threat-cases.md`: 12 ataques a resistir (escalamiento de rol, createdBy
   forjado, IDs ajenos, token manipulado/vencido, body mixto, headers raros…).

Ese diseño es el que después implementó el código.

## What I asked

Tras aprobar el checkpoint, pedí completar e implementar la estación 0 y las
estaciones 2 a 7 respetando las decisiones de la matriz: registro con
allowlist, hashing scrypt previo a persistir, login con respuesta uniforme,
JWT con claims y verificación estrictos, middleware Bearer, propiedad desde
el token y permisos por rol/política.

## What the AI proposed

- `users.store.js` + `user.mapper.js` (queries parametrizadas, mapper que
  descarta `password_hash`).
- `auth.service.js`: allowlist, normalización de email, validación de
  password, hash antes de insertar, `23505` -> 409 genérico, login con
  `INVALID_CREDENTIALS` idéntico y scrypt contra un hash "tonto" cuando el
  email no existe.
- `token.js` con `jose`: `SignJWT`/`jwtVerify` con `sub`, `role`, `iat`,
  `exp`, `iss`, `aud`.
- `authenticate.js` y el cableado en `app.js` / `requests.routes.js`.
- Propiedad y permisos: `created_by`/`changed_by` en store y mapper, scope
  en SQL para requester, y `request.policy.js` con funciones puras.
- Las migraciones 003–005 fueron aplicadas a la base (las provee el taller).

## What I accepted

El esquema propuesto completo, tal cual: primero la verificación del
validador por estación, y después la corrección que pidió el propio validador
(ver «security mistakes»).

## What I rejected

- No se aceptó permitir `role` en el registro (escalamiento).
- No se aceptó devolver `403` para recursos ajenos: se usa `404` idéntico
  para no revelar existencia.
- No se aceptó el PATCH parcial de un body mixto: la autorización es
  todo-o-nada.
- No se aceptó decodificar el JWT sin verificar ni guardar la identidad en
  otra parte que no fuera `req.auth`.

## Security mistakes I detected

El validador (`--stage authorization`) encontró un fallo real: `canEditContent`
esperaba la representación mappeada (`createdBy`) pero recibía la fila cruda
de SQL (`created_by`), así que el dueño nunca coincidía y un requester no podía
editar su propia solicitud abierta. Se corrigió pasando `mapRequestRow(current)`
a todas las políticas (view, history y edit).

## How I verified the implementation

- `node --check` en todos los archivos.
- Prueba de humo HTTP del servidor (401 para rutas sin token, 400 para
  campos controlados, 503 con la base inalcanzable).
- `npm run validate:class-05 -- --stage <name>` por estación, en orden.
- Boss battle integral: `RESULT: 12/12 · CLASS 05 COMPLETED`.

## What I still do not understand

- El detalle interno de cómo jose maneja la lista de algoritmos permitidos al
  verificar (por qué conviene pasar explícitamente `algorithms: ['HS256']`).
- La diferencia práctica entre el pooler de sesión (5432) y el de
  transacciones (6543) de Supabase y en qué casos uno rompe el protocolo
  preparado de node-postgres.