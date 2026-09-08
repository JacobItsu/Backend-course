# Registro de decisiones — Clase 05

Una entrada por decisión no obvia: qué decidiste, qué alternativas había y por
qué.

## 1. Dónde se guarda la identidad del actor

**Decisión:** en `req.auth = { userId, role }`, construido por el middleware
`authenticate` exclusivamente a partir del payload del JWT verificado.
**Alternativas:** guardarlo en `res.locals`, en una variable de contexto
global, o re-derivar el usuario en cada servicio consultando la base.
**Por qué:** `req.auth` es el único sitio "oficial" del request en el stack
de Express; viviene de la verificación (firma + exp + iss + aud), no de una
base de datos por request; y no es global, así que cada petición lleva su
propio actor sin estado compartido.

## 2. Por qué los recursos ajenos responden 404

**Decisión:** `GET /requests/:id` y su historial responden
`404 REQUEST_NOT_FOUND` cuando el recurso es de otro usuario, distinguiendo
exactamente igual que si no existiera.
**Alternativa:** responder `403 FORBIDDEN` (identificado pero prohibido).
**Por qué:** `403` revela que el recurso existe (y que solo estás bloqueado),
lo que permite enumerar IDs ajenos. `404` idéntico no confirma existencia:
misma respuesta para "no existe", "es ajeno" y "es heredado sin dueño".

## 3. Qué pasa con las solicitudes heredadas (`created_by IS NULL`)

**Decisión:** solo el `agent` las ve; un `requester` jamás puede "ser dueño"
de un NULL.
**Alternativa:** hacerlas visibles a todos, o invisibles a todos.
**Por qué:** no tienen persona autora verificable; entregarlas a un
`requester` filtraría información que no le pertenece, y ocultarlas
rompería el flujo de soporte. El `agent` es el rol operativo y las ve todas.

## 4. Reglas de estado intactas para todos los roles

**Decisión:** la máquina de estados de la clase 03 (transiciones y estados
terminales → 409) se evalúa SIEMPRE, también para `agents`.
**Por qué:** los permisos deciden *quién* puede tocar, pero el dominio
decide *qué* es legal. Un `agent` tiene la potestad de cambiar el estado,
no de saltarse el dominio.

## 5. Autorización todo-o-nada en PATCH

**Decisión:** si un body mezcla un campo permitido con uno prohibido, el
PATCH completo responde `403 FORBIDDEN` y no se escribe nada.
**Por qué:** aplicar solo la parte permitida dejaría actualizaciones
parciales inesperadas (un título cambiado "de contrabando" junto a una
prioridad rechazada). Se autoriza el cambio completo antes de escribir.

## 6. Login con respuesta y costo uniformes

**Decisión:** `login` responde el mismo `401 INVALID_CREDENTIALS` (mismo
mensaje) para email inexistente o password incorrecta, y además corre
`scrypt` contra un hash "tonto" cuando el email no existe.
**Por qué:** la respuesta idéntica evita enumerar cuentas observando el
body; el costo constante evita enumerarlas observando el tiempo de
respuesta.

## 7. Los hashes no cruzan el borde del módulo

**Decisión:** el mapper `mapUserRow` descarta `password_hash`; los INSERT de
`users` no lo devuelven en `RETURNING`.
**Por qué:** el hash es un secreto de la capa de datos. Si la frontera nunca
lo expone, ninguna ruta puede filtrarlo por accidente.