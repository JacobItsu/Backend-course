# Análisis Independiente — API Lite

## Tabla de Análisis

| Endpoint | Intención | Entrada | Respuesta Actual | Problema | Propuesta |
|----------|-----------|---------|------------------|----------|-----------|
| `GET /getRequests` | Listar todas las solicitudes | Ninguna | 200 con arreglo JSON | Ruta contiene un verbo (`get`) en lugar de un sustantivo | `GET /requests` → 200 con arreglo |
| `GET /requests/:id` | Consultar una solicitud por ID | Path parameter `:id` | 200 con `{"error":"Request not found"}` si no existe | Devuelve 200 aunque el recurso no exista; el estado no es coherente con el cuerpo | `GET /requests/:id` → 200 o 404 |
| `POST /requests` | Crear una nueva solicitud | Body JSON con title, description, priority | 200 con la solicitud creada | Devuelve 200 en lugar de 201; acepta creación sin título | `POST /requests` → 201 o 400 |

---

## Evidencia de Ejecución

### Prueba 1: Listar solicitudes

```bash
curl -i http://localhost:3000/getRequests
```

**Respuesta:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"},{"id":2,"title":"Broken chair in the lab","description":"One chair in the computer lab has a loose back rest.","status":"in-progress","priority":"medium"},{"id":3,"title":"Wi-Fi drops in the library","description":"The connection drops every few minutes on the second floor.","status":"open","priority":"low"}]
```

**Observación:** La ruta funciona pero contiene el verbo "get" en su nombre. Una ruta RESTful debería ser un sustantivo.

---

### Prueba 2: Consultar solicitud existente

```bash
curl -i http://localhost:3000/requests/1
```

**Respuesta:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"}
```

---

### Prueba 3: Consultar solicitud inexistente

```bash
curl -i http://localhost:3000/requests/99
```

**Respuesta:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"error":"Request not found"}
```

**Observación crítica:** El servidor devuelve 200 OK con un cuerpo que indica error. Un cliente automático que solo lee el estado interpretaría esto como éxito. El estado y el cuerpo se contradicen.

---

### Prueba 4: Crear solicitud completa

```bash
curl -i -X POST http://localhost:3000/requests \
  -H "Content-Type: application/json" \
  -d '{"title":"Falla en impresora","description":"La impresora del piso 2 no imprime","priority":"high"}'
```

**Respuesta:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":4,"title":"Falla en impresora","description":"La impresora del piso 2 no imprime","status":"open","priority":"high"}
```

**Observación:** Se creó un recurso nuevo pero el estado es 200 en lugar de 201 Created.

---

### Prueba 5: Crear solicitud sin título

```bash
curl -i -X POST http://localhost:3000/requests \
  -H "Content-Type: application/json" \
  -d '{"description":"Solicitud sin titulo","priority":"low"}'
```

**Respuesta:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":5,"description":"Solicitud sin titulo","status":"open","priority":"low"}
```

**Observación:** El servidor acepta y crea una solicitud sin título. El título es un campo esencial para identificar la solicitud; no debería permitirse su omisión.

---

## Respuestas a las Ocho Preguntas Guía

### 1. ¿Qué hace cada endpoint exactamente?

- `GET /getRequests`: Devuelve la lista completa de solicitudes almacenadas en memoria.
- `GET /requests/:id`: Busca una solicitud por su ID numérico. Si la encuentra, la devuelve; si no, devuelve un objeto con un campo `error`.
- `POST /requests`: Recibe datos en el body JSON, crea una solicitud con un ID autoincremental y la agrega al arreglo.

### 2. ¿Qué datos recibe y de dónde los toma?

- `GET /getRequests`: No recibe datos.
- `GET /requests/:id`: Recibe el ID como parte de la ruta (path parameter).
- `POST /requests`: Recibe `title`, `description` y `priority` en el body como JSON.

### 3. ¿Qué responde en cada caso y con qué estado?

- `GET /getRequests`: 200 con un arreglo JSON.
- `GET /requests/1`: 200 con el objeto solicitud.
- `GET /requests/99`: 200 con `{"error":"Request not found"}`.
- `POST /requests` (válido): 200 con la solicitud creada.
- `POST /requests` (sin título): 200 con la solicitud creada de todas formas.

### 4. ¿El estado es coherente con el cuerpo?

No. Hay dos contradicciones principales:
- `GET /requests/99` devuelve 200 pero el cuerpo indica que no se encontró el recurso.
- `POST /requests` devuelve 200 cuando debería devolver 201 para indicar creación.

### 5. ¿Qué campos son obligatorios y cuáles opcionales?

No hay validación. El servidor acepta cualquier body, incluso sin título. Todos los campos son tratados como opcionales.

### 6. ¿La ruta está nombrada como sustantivo o como verbo?

`/getRequests` usa un verbo ("get"). Las demás rutas (`/requests/:id`, `/requests`) usan sustantivos.

### 7. ¿Qué cambiarías si diseñaras este contrato?

1. Cambiaría `/getRequests` por `/requests` (sustantivo, no verbo).
2. Devolvería 201 en creaciones exitosas.
3. Devolvería 404 cuando un ID no existe, con 200 solo para éxitos reales.
4. Validaría que el título esté presente y devolvería 400 si falta o está vacío.
5. El estado del recurso debería inicializarse como `open` siempre, asignado por el servidor.

### 8. ¿Qué partes son de Express y cuáles serían iguales sin framework?

- **Express:** `app.get()`, `app.post()`, `express.json()`, `req.params`, `req.body`, `res.json()`, `res.status()`.
- **Igual sin framework:** Los conceptos de método HTTP, rutas, códigos de estado, el formato JSON del body, la lógica de negocio (buscar en arreglo, crear objeto, validar).
