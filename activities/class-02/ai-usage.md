# AI Usage — Clase 02

## What I asked for

- Implementación de los tres endpoints (GET /requests, GET /requests/:id, POST /requests) siguiendo el contrato HTTP definido.
- Estructura de archivos separada por responsabilidades.
- Validación del campo title en POST /requests.

## What the AI proposed

- Middleware de logging para cada petición.
- Validación de esquema con librería Joi.
- Endpoints adicionales: PUT, PATCH y DELETE.
- Conexión a base de datos MongoDB.

## What I accepted

- La implementación de los tres endpoints solicitados.
- La estructura de archivos propuesta (app.js, server.js, routes/, data/).
- La validación básica del campo title con condicional.

## What I changed or rejected

- Rechacé el middleware de logging porque no estaba en la especificación.
- Rechacé la validación con Joi porque增加了 dependencia innecesaria.
- Rechacé PUT, PATCH y DELETE porque estaban fuera del alcance.
- Rechacé MongoDB porque los datos deben vivir en memoria.

## How I verified it

- Ejecuté cada endpoint con curl y verifiqué los códigos de estado.
- Comprobé que POST /requests devuelve 201 con title válido.
- Comprobé que POST /requests devuelve 400 sin title.
- Comprobé que GET /requests/99 devuelve 404.
- Verifiqué que no hay dependencias innecesarias en package.json.

## What I still do not understand

- Cómo funciona el ciclo de vida completo de una petición en Express desde que llega hasta que se envía la respuesta.
- Cuándo es apropiado usar middleware personalizados vs configuración directa.
