# Comparación Lite vs Full

## Tabla de Dimensiones

| Dimensión | Lite | Full |
|-----------|------|------|
| **Contrato** | Reconstruido desde código existente con inconsistencias | Declarado antes de escribir código |
| **Organización** | Un solo archivo server.js | Estructura en múltiples archivos por responsabilidad |
| **IA** | Prohibida en la primera fase; permitida después con registro | Permitida desde el inicio bajo restricciones declaradas |
| **Lectura** | Ejecutar endpoints y anotar comportamiento observado | Leer especificación y contrato antes de implementar |
| **Modificación** | Corregir defectos encontrados en el análisis | Implementar según contrato definido |
| **Complejidad** | Baja: 3 endpoints, un archivo | Media: 3 endpoints, estructura modular |
| **Verificación** | Comparar comportamiento antes/después de correcciones | Verificar contra contrato HTTP definido |
| **Extensibilidad** | Limitada: todo está en un archivo | Alta: separación de responsabilidades permite crecer |

---

## 14 Preguntas de Reflexión

### 1. ¿Qué diferencia notaste entre reconstruir un contrato ya existente y definirlo antes de escribir código?

En el Lite, tuve que inferir el contrato observando el comportamiento real del servidor, lo que reveló inconsistencias que no eran obviles solo leyendo el código. En el Full, el contrato fue la guía desde el inicio: cada decisión de implementación tenía una referencia clara contra la cual verificar.

### 2. ¿Qué inconsistencias encontraste en el proyecto Lite y con qué evidencia las detectaste?

Encontré cuatro inconsistencias:
1. Ruta `/getRequests` con verbo en lugar de sustantivo — evidencia: la ruta funciona pero viola convenciones HTTP.
2. Respuesta 200 con error para IDs inexistentes — evidencia: `curl -i /requests/99` devuelve 200 con `{"error":"Request not found"}`.
3. Respuesta 200 en creaciones — evidencia: `curl -i -X POST /requests` devuelve 200 en lugar de 201.
4. Acepta creaciones sin título — evidencia: `curl -i -X POST /requests -d '{"description":"test"}'` crea un registro con title undefined.

### 3. ¿Qué observaste al ejecutar que no habrías deducido solo leyendo el código?

Que el objeto con `{"error":"Request not found"}` devuelto para IDs inexistentes parece exitoso a primera vista porque el estado es 200. Solo al ejecutar y ver el 200 junto con un body de error, se hace evidente la contradicción entre estado y contenido.

### 4. ¿Qué información comunica el método HTTP que la ruta por sí sola no comunica?

El método comunica la intención: GET para leer, POST para crear. Una ruta como `/requests` puede ser GET (listar) o POST (crear); sin el método, la ruta por sí sola es ambigua.

### 5. ¿Cuándo usaste un path parameter y cuándo un query parameter, y por qué?

Usé path parameter para identificar un recurso concreto (`/requests/:id`) porque el ID es parte de la dirección del recurso. No usé query parameters en este proyecto, pero se usarían para filtros como `/requests?status=open`.

### 6. ¿Por qué un mismo endpoint puede responder 200 o 404 sin que ninguna de las dos sea un fallo del servidor?

Porque ambos son respuestas válidas del contrato: 200 indica que el recurso existe y se devolvió, 404 indica que el recurso no existe pero el servidor funcionó correctamente al informarlo.

### 7. ¿Qué diferencia hay entre 200 y 201 y por qué le importa a quien consume la API?

200 confirma que la operación fue exitosa. 201 indica que se creó un nuevo recurso. Le importa porque el cliente puede saber si debe esperar un ID nuevo en la respuesta o simplemente una confirmación.

### 8. ¿Qué responsabilidad cumple cada archivo del proyecto Full y qué se perdería si los fusionaras?

- `server.js`: Inicia el proceso y escucha. Se perdería la separación entre configuración y ejecución.
- `app.js`: Configura middleware y rutas. Se mezclaría con la inicialización del servidor.
- `routes/requests.routes.js`: Declara endpoints. Se perdería la modularidad al agregar más recursos.
- `data/requests.js`: Almacena datos. Se cambiaría al integrar una base de datos.
- `http-contract.md`: Documenta el contrato. Se perdería la referencia externa al código.

### 9. ¿Qué partes de tu código son de Express y cuáles son de HTTP?

- **Express:** `router.get()`, `router.post()`, `express.json()`, `req.params`, `req.body`, `res.json()`, `res.status()`.
- **HTTP:** Los códigos de estado (200, 201, 400, 404), los métodos (GET, POST), los headers (Content-Type), la estructura de request/response.

### 10. ¿Qué decidiste tú antes de escribir el primer prompt y qué le pediste exactamente a la IA?

Definí la estructura de archivos, los endpoints necesarios y el contrato HTTP antes de pedir a la IA. Le pedí que implementara cada endpoint según el contrato, respetando las exclusiones (sin PUT, PATCH, DELETE, sin base de datos).

### 11. ¿Qué propuso la IA que estaba fuera del alcance y cómo lo detectaste?

La IA propusó agregar un middleware de logging y validación con Joi. Lo detecté porque no estaban en la especificación y violaban las exclusiones declaradas.

### 12. ¿Qué parte del código generado no podrías explicar sin volver a leerla, y qué hiciste al respecto?

La lógica de manejo de errores con `return res.status(404).json()`. Lo estudié hasta entender que el `return` detiene la ejecución del handler después de enviar la respuesta.

### 13. ¿Qué habría pasado si le hubieras pedido el proyecto a la IA sin escribir antes la especificación?

La IA habría producido una interpretación razonable pero probablemente con más funcionalidad de la necesaria (PUT, DELETE, validación, etc.), sin la estructura de archivos correcta y sin respetar las exclusiones.

### 14. ¿Qué límite de este diseño o de HTTP aparecería si el sistema tuviera que crecer?

La persistencia en memoria es el límite más inmediato. También la ausencia de autenticación, paginación y manejo de concurrencia. HTTP seguiría siendo adecuado, pero la capa de persistencia y seguridad necesitaría evolucionar.

---

## Reflexión Final

Si tuviera que empezar de nuevo el proyecto Full, escribiría la especificación aún más detallada, incluyendo ejemplos de request/response para cada endpoint. También documentaría las exclusiones de forma más explícita para evitar que la IA propusiera funcionalidad no deseada.
