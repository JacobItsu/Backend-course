# Reflexión — Clase 05

Responde con tus palabras al cerrar el taller:

1. ¿Qué diferencia hay entre identidad, autenticación y autorización?
   Identidad es QUIÉN soy: la respuesta a "¿quién realiza esta petición?". En
   esta API la identidad vive en `req.auth = { userId, role }`, y su única
   fuente confiable es el JWT ya verificado. Autenticación es CÓMO demuestro
   esa identidad: presentar `Authorization: Bearer <token>` válido que el
   middleware `authenticate` comprueba. Autorización es QUÉ puedo HACER siendo
   esa identidad: las reglas de la matriz en `request.policy.js` (un requester
   edita solo sus solicitudes abiertas, un agent cambia prioridad y estado,
   etc.). Primero autentico para tener una identidad; después autorizo usando
   esa identidad. Nunca mezclo las dos capas.

2. ¿Por qué `createdBy` y `changedBy` nunca llegan desde el body?
   Porque son datos controlados por el servidor: describen autoría/actuación y
   deben reflejar la identidad VERIFICADA, no lo que el cliente dice. Si el
   body pudiera fijarlos, un atacante registraría solicitudes como otro usuario
   (`createdBy: <id ajeno>`) o atribuiría transiciones a quien no las hizo.
   La regla que lo garantiza: se rechaza con `400 SERVER_CONTROLLED_FIELD`
   cualquier body que los incluya, y el valor se toma de `req.auth.userId`.
   Además `created_by`/`changed_by` son también FKs con `ON DELETE RESTRICT`.

3. ¿Qué diferencia hay entre `401` y `403`? ¿Y por qué a veces `404`?
   `401` significa "no hay identidad confiable": sin token, esquema que no es
   Bearer, token que no verifica, o login con credenciales incorrectas. `403`
   significa "hay identidad, pero esta operación te está prohibida": requester
   cambiando prioridad, agent creando o editando contenido. A veces `404` en
   lugar de `403`: cuando no conviene confirmar que un recurso existe. Si un
   requester pide una solicitud ajena y le doy `403`, con un par de peticiones
   descubre IDs que existen. Respondiendo `404` idéntico al de "no existe", el
   recurso ajeno, el inexistente y el heredado sin dueño son
   indistinguibles.

4. ¿Por qué decodificar un JWT no permite confiar en él?
   Decodificar solo aplica base64url al payload: cualquiera puede pegarle
   base64 a cualquier JSON y leerlo. La confianza nace de la FIRMA: verificar
   comprueba que el token fue firmado con el `JWT_SECRET` real, con el
   algoritmo permitido, y que issuer, audience y `exp` son válidos. El
   validador lo demostró: edité el payload de un token a mano (le puse
   `role: "agent"`) sin re-firmar y el API respondió `401 INVALID_TOKEN`.
   Leer es gratis; creer requiere verificación.

5. ¿Por qué el `agent` sigue sujeto a la máquina de estados?
   Porque los permisos y el dominio son capas distintas. Los permisos dicen
   QUÉ personajes pueden invocar una operación (el agent puede cambiar
   estado); el dominio dice QUÉ cambios son válidos (de `open` a `closed`
   directamente está prohibido). Que el agent tenga permiso no convierte en
   legal algo que el negocio no permite; además, si se rompiera la máquina,
   el historial dejaría de ser un registro real y los estados terminales
   dejarían de proteger la solicitud terminada. Por eso un `open -> closed`
   responde `409 INVALID_STATUS_TRANSITION` igual para el agent.

6. ¿Qué intentó romper el validador y qué limitación conserva esta solución?
   Intentó romper el registro (escalamiento de rol, normalización, duplicados
   genéricos), el almacenamiento (que el hash nunca viaje), el login (que no
   se pueda enumerar cuentas), el JWT (token editado, vencido, de otra clave),
   los endpoints protegidos, la propiedad (createdBy forjado, aislamiento
   requester/legacy), los permisos (body mixto, edición tardía) y la fuga de
   datos sensibles. Encontró un fallo real (las políticas leían `createdBy`
   pero recibían la fila cruda con `created_by`) que corregí. Limitación: el
   validador prueba comportamientos por HTTP y el esquema, pero no mide por
   ejemplo el tiempo de respuesta de cada login (mi mitigación con hash
   "tonto" es manual, no está exigida por ningún cheque), ni ataca el
   frontend (entrega 05A), ni el hilo de las promociones de rol ni la
   rotación de `JWT_SECRET`. El sistema queda tan seguro como lo que el
   validador y yo pudimos imaginar.