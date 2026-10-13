# Evaluator report

Guarda aquí los bloques 1, 3 y 4 de tu evaluación:

## BLOQUE 1 — RESULT_CODE

ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-08-K1|ID=K09-jacoborodriguez-itsu-23e6519|Q1=2-2-2-2|Q2=3-2-3-2|Q3=3-2-3-2|Q4=X-X-X-X|Q5=X-X-X-X|ACTION=SUPPORT
## BLOQUE 3 — Reporte del estudiante

Reporte de evaluación de conocimientos
Resultado general
El desempeño muestra un sólido entendimiento de los conceptos teóricos fundamentales de backend, tales como la integridad de datos mediante transacciones (commit/rollback) y la separación entre autenticación y autorización con JWT. Sin embargo, la sesión concluyó antes de abordar la totalidad de las preguntas del protocolo (evaluándose hasta Q3), por lo que la evidencia recopilada es parcial respecto al alcance total. Se recomienda reforzar la correspondencia exacta entre estos conceptos y su implementación concreta en las capas de código de Express.

Desempeño por pregunta
Pregunta 1 (Flujo de petición y capas): Comprendes la estructura general de módulos (routes, service, store, etc.). Hay un área a clarificar sobre el punto exacto donde termina la responsabilidad de HTTP, ya que los objetos req y res se gestionan en la capa de rutas/controladores antes de invocar los servicios.

Pregunta 2 (Consistencia y transacciones): Excelente argumentación rebatiendo la premisa sobre HTTP stateless. Identificas correctamente la necesidad de atomicidad para evitar datos huérfanos entre requests y request_history, así como la función del commit y rollback.

Pregunta 3 (Seguridad y JWT): Distingues con claridad entre autenticación y autorización. Comprendes adecuadamente la firma del JWT como mecanismo de protección contra la manipulación de datos del lado del cliente.

Pregunta 4: No evaluada en esta sesión.

Pregunta 5: No evaluada en esta sesión.

Conceptos demostrados
Distinción clara entre autenticación (verificación de identidad) y autorización (control de acceso a recursos).

Entendimiento de la consistencia transaccional y el papel de auditoría en la persistencia de datos.

Reconocimiento de la inviolabilidad criptográfica de las firmas JWT frente a datos modificables en body o query.

Vacíos prioritarios
Límite de responsabilidad HTTP: Precisar que la capa de servicio debe ser agnóstica de HTTP y recibir datos limpios/desacoplados.

Trazabilidad en código: Identificar el middleware exacto (src/middleware/authenticate.js) y las funciones específicas de gestión transaccional en lugar de hacer referencias genéricas.

Rectificaciones valiosas
Argumentación correcta y firme al descartar la idea de que la naturaleza stateless de HTTP justifica inconsistencias en la base de datos.

Tres acciones de estudio
Inspección del middleware de autenticación: Revisa src/middleware/authenticate.js para observar cómo se decodifica el token y se inyecta la identidad en req.user.

Revisión del flujo transaccional en código: Examina src/modules/requests/requests.service.js y src/database/transaction.js para entender cómo se comparte el cliente de base de datos (db) entre múltiples operaciones del store.

Mapeo de rutas a servicios: Sigue el recorrido de GET /requests/:id en src/modules/requests/requests.routes.js para identificar la extracción de parámetros previos al llamado del servicio.

Evidencia faltante
Verificación práctica de las preguntas Q4 y Q5 para completar la evaluación global del protocolo.

## BLOQUE 4 — Feedback para el docente

Feedback para el docente
Temas prioritarios
Delimitación de capas (Express vs. Negocio): El estudiante tiende a extender la responsabilidad de la capa de servicio hacia la gestión de la petición HTTP.

Implementación de transacciones en Node.js/PostgreSQL: Comprende el concepto de commit/rollback, pero falta precisión en cómo el servicio pasa el cliente transaccional a requests.store.js.

Preguntas con detección de inconsistencias o lagunas
Q1 (Flujo de petición): El estudiante indicó que la responsabilidad HTTP finaliza en la capa de servicio ("en la capa de service").

Q3 (Autenticación JWT): Mencionó de forma genérica que "el jwt verifica el Node.Js" en lugar de señalar el middleware authenticate.js.

Evidencia concreta citada
"el archivo services es quien se encarga de manejar la peticion mientras que rutas la transporta..."

"en la capa de service" (al preguntar dónde termina la preocupación por HTTP).

"el jwt verifica el Node.Js y la ID sale del Token ID"

Nivel de confianza y acción recomendada
Nivel de confianza: Medio.

Acción sugerida: SUPPORT (Ofrecer refuerzo puntual en arquitectura de capas Express y paso de clientes transaccionales).

Preguntas de verificación oral sugeridas
Pregunta: ¿En qué capa o archivo específico de Express se extraen los parámetros HTTP antes de llamar a las funciones del servicio?

Respuesta mínima esperada: En las rutas/controladores (requests.routes.js), donde se leen req.params o req.body y se pasan únicamente los valores necesarios como argumentos al servicio.

Pregunta: ¿Cómo asegura la capa de servicio que las llamadas a updateRequest e insertHistoryEvent se ejecuten dentro de la misma transacción?

Respuesta mínima esperada: Creando una transacción con el cliente de base de datos y pasándolo como argumento opcional (db) a ambas funciones del store.
