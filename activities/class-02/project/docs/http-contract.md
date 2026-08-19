# Contrato HTTP — Request API Full

## Recurso

Una **solicitud** (`request`) representa un reporte de mantenimiento dentro de una institución.
Contiene un título descriptivo, una descripción opcional, un estado que indica su progreso
y una prioridad que refleja la urgencia.

### Forma del recurso

| Campo         | Tipo   | Obligatorio | Quién lo asigna | Notas |
| ------------- | ------ | ----------- | --------------- | ----- |
| `id`          | number | Sí          | Servidor        | Identificador único, autoincremental |
| `title`       | string | Sí          | Cliente         | Título descriptivo de la solicitud |
| `description` | string | No          | Cliente         | Detalles adicionales, puede estar vacío |
| `status`      | string | Sí          | Servidor        | Siempre inicia como `'open'` |
| `priority`    | string | No          | Cliente         | `'high'`, `'medium'` o `'low'` |

---

## Endpoint 1 — Listar solicitudes

| Elemento              | Valor |
| --------------------- | ----- |
| Método                | GET |
| Ruta                  | /requests |
| Entrada               | Ninguna |
| Respuesta de éxito    | 200 con arreglo JSON de solicitudes |
| Respuestas de error   | Ninguna (devuelve arreglo vacío si no hay datos) |

**Ejemplo de respuesta**

```json
[
  {
    "id": 1,
    "title": "Projector does not turn on",
    "description": "The projector in room 204 shows no image during class.",
    "status": "open",
    "priority": "high"
  }
]
```

---

## Endpoint 2 — Consultar una solicitud

| Elemento              | Valor |
| --------------------- | ----- |
| Método                | GET |
| Ruta                  | /requests/:id |
| Entrada               | Path parameter `:id` (number) |
| Respuesta de éxito    | 200 con objeto JSON de la solicitud |
| Respuestas de error   | 404 si el ID no existe |

**Ejemplo de respuesta (éxito)**

```json
{
  "id": 1,
  "title": "Projector does not turn on",
  "description": "The projector in room 204 shows no image during class.",
  "status": "open",
  "priority": "high"
}
```

**Ejemplo de respuesta (error)**

```json
{
  "error": "Request not found"
}
```

---

## Endpoint 3 — Crear una solicitud

| Elemento              | Valor |
| --------------------- | ----- |
| Método                | POST |
| Ruta                  | /requests |
| Entrada               | Body JSON con `title` (obligatorio), `description` y `priority` (opcionales) |
| Respuesta de éxito    | 201 con objeto JSON de la solicitud creada |
| Respuestas de error   | 400 si falta o está vacío el campo `title` |

**Ejemplo de body de la petición**

```json
{
  "title": "Leaking faucet",
  "description": "The faucet in the third floor bathroom leaks.",
  "priority": "medium"
}
```

**Ejemplo de respuesta (éxito)**

```json
{
  "id": 4,
  "title": "Leaking faucet",
  "description": "The faucet in the third floor bathroom leaks.",
  "status": "open",
  "priority": "medium"
}
```

**Ejemplo de respuesta (error de validación)**

```json
{
  "error": "Title is required"
}
```

---

## Reglas transversales

1. `application/json`
2. 404
3. Siempre tiene un campo `error` con un mensaje descriptivo en texto plano.
4. Ignora campos desconocidos; solo procesa `title`, `description` y `priority`.

## Decisiones que tomaste y por qué

- **201 para creación:** Un recurso nuevo se creó; el cliente debe poder distinguir una creación de una consulta.
- **400 para title faltante:** El problema es del cliente (envió datos incompletos), no del servidor.
- **404 para ID inexistente:** El recurso no existe; el servidor funcionó correctamente al informarlo.
- **status siempre 'open':** El servidor asigna el estado inicial; el cliente no puede definirlo al crear.
- **Campos opcionales:** `description` y `priority` pueden omitirse; el servidor asigna valores por defecto.
