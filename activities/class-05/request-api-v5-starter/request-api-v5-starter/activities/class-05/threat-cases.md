# Casos adversariales — Request API v5

Describe al menos ocho ataques que tu implementación deberá resistir, con el
resultado exacto esperado (código HTTP + `error.code`). Piensa como quien NO
respeta tu frontend: registro con `role`, `createdBy` inventado, IDs ajenos,
tokens editados o vencidos, bodies mixtos, headers extraños…

1. Escalamiento de rol en el registro: `POST /auth/register` con
   `{ email, password, role: "agent" }` → `400 SERVER_CONTROLLED_FIELD`.
   Tampoco sirven `id`, `createdAt`, `passwordHash` ni `createdBy` en el body
   del registro: mismo `400` (allowlist de `email`/`password`).

2. Inventar el dueño al crear: `POST /requests` con `createdBy` de otra
   persona en el body → `400 SERVER_CONTROLLED_FIELD`. `createdBy` sale del
   token verificado (nunca del body), así que forzar `createdBy` es inútil.

3. Nacer con un estado que no corresponde: `POST /requests` con `status` en
   el body → `400 SERVER_CONTROLLED_FIELD`. Toda solicitud nueva nace `open`.

4. Ver una solicitud ajena: alice pide `GET /requests/:id` con una
   solicitud de bob → `404 REQUEST_NOT_FOUND`, idéntico (mismo código y
   mensaje) al de una solicitud inexistente. La respuesta no revela que el
   recurso existe. El historial ajeno (`GET /requests/:id/history`) también
   responde `404 REQUEST_NOT_FOUND`.

5. Token manipulado: al token de alice se le edita el payload a mano
   (por ejemplo `role: "agent"`) conservando la firma original →
   `GET /auth/me` responde `401 INVALID_TOKEN`: verificar firma, algoritmo,
   issuer, audience y `exp`, jamás confiar en un payload solo decodificado.

6. Token vencido o firmado con otra clave: token expirado o firmado con un
   `JWT_SECRET` distinto → `401 INVALID_TOKEN`, con la misma respuesta
   genérica en todos los casos de verificación fallida (no se revela qué
   cheque falló).

7. Acceso sin identidad o con header raro: `GET /requests` sin header, con
   `Authorization: Basic ...`, con `Bearer ` vacío o con un token a secas →
   `401 AUTHENTICATION_REQUIRED`. Solo cuenta el esquema exacto
   `Bearer <token>`.

8. Body mixto en PATCH (todo-o-nada): alice manda
   `PATCH /requests/:id` con `{ title: "...", priority: "low" }` sobre su
   solicitud abierta → `403 FORBIDDEN` y NO se aplica el título: la
   autorización evalúa el cambio completo antes de escribir nada. También
   `{ status: "in_progress", changedBy: <otro> }` → `400 SERVER_CONTROLLED_FIELD`.

9. Requester abusando de permisos de agent: `PATCH /requests/:id` con
   `priority` o `status` por un `requester` (aunque sea su solicitud) →
   `403 FORBIDDEN`. Un `agent` intentando `POST /requests` o editar
   título/descripción → también `403 FORBIDDEN`.

10. Estado terminal intacto: `PATCH /requests/:id` sobre una solicitud
    `closed`/`cancelled` (o una transición inválida como `open -> closed`) →
    `409 REQUEST_IN_TERMINAL_STATUS` / `409 INVALID_STATUS_TRANSITION`,
    incluso para `agents`: los roles no saltan la máquina de estados.

11. Enumeración de cuentas vía login: email inexistente y password
    incorrecta responden EXACTAMENTE igual: `401 INVALID_CREDENTIALS` con el
    mismo código y mensaje («Email or password is incorrect.»).

12. Fuga de material sensible: ninguna respuesta incluye hashes de password
    (`scrypt$...`), el nombre de la columna `password_hash`, la URL de la
    base, la firma `JWT_SECRET` ni passwords en claro. El mapper es la única
    frontera y descarta el hash antes del HTTP.