# Examen de conocimiento asistido por IA — clases 1-7

Guarda aquí el TRANSCRIPT COMPLETO de tu examen conversacional
(ITSU-KNOWLEDGE-01-07-1.0): todas las preguntas, todas tus respuestas,
todas las repreguntas y los cuatro bloques del cierre. Sin editar.

> Este examen complementa la evaluación de evidencia: mide lo que puedes
> explicar SIN el repositorio delante. El docente cruza ambos resultados
> y puede verificar cualquier respuesta oralmente.

## Metadata de mi examen

* studentId: jacoborodriguez.itsu@gmail.com
* Modelo utilizado: Google Gemini
* Fecha: 2026-10-06
* ¿Formato inválido y reparado una vez?: no

## Cómo exportar la conversación

Antes de cerrar la ventana del chat: exporta o copia la conversación
COMPLETA. Gemini: compartir/exportar o selección manual desde el inicio.
Copilot en VS Code: paleta → "Chat: Export". Copilot web: seleccionar
todo y copiar. opencode/terminal: `/export`/`/share` o copiar el
scrollback. En cualquier herramienta, seleccionar todo + copiar siempre
funciona. Debe ser texto — una captura de pantalla no es entrega.

## TRANSCRIPT COMPLETO (desde COMENZAR hasta el AVISO DE EXPORTACIÓN)

```text
IA: COMENZAR - Examen de conocimiento clases 1-7. Primera pregunta:

IA: Clase 01 - Explica qué hace un middleware en Express y por qué el orden importa.

Yo: Un middleware es una función que intercepta la petición antes de llegar al handler. Puede leer/modificar req/res, decidir si continúa (next()) o termina la respuesta. El orden importa porque cada middleware ve lo que los anteriores hicieron - ej: request-id debe ir antes que logger para que el log tenga el ID.

IA: Correcto. Repregunta: ¿Qué pasa si un middleware no llama a next() ni responde?

Yo: La petición se queda colgada - el cliente espera indefinidamente hasta timeout. Es un bug común.

IA: Bien. Clase 02 - Diferencia entre 400, 404 y 409 con ejemplos del proyecto.

Yo: 400 = request mal formado (body inválido, id no numérico). 404 = recurso no existe (GET /requests/999). 409 = conflicto de estado (claim sobre request ya asignado, transición inválida closed->in_progress).

IA: Correcto. Clase 03 - Explica la máquina de estados de una request y por qué no se puede hacer PATCH status de closed a open.

Yo: Estados: open -> in_progress -> resolved -> closed. También open -> cancelled. No hay flecha de vuelta de closed/cancelled a nada - son terminales. PATCH status closed->open violaría la regla de negocio: una request cerrada no se reabre, se crea una nueva.

IA: Bien. Clase 04 - Qué es una transacción y por qué createRequest la usa.

Yo: Transacción agrupa varias operaciones SQL en una unidad atómica: todo commit o todo rollback. createRequest la usa porque inserta la request Y su evento de historial (NULL->open) juntos - si falla uno, no queda request sin historial ni historial huérfano.

IA: Correcto. Clase 05 - Diferencia entre authentication y authorization. ¿Dónde vive cada una en el proyecto?

Yo: Authentication = verificar identidad (middleware authenticate, valida JWT, pone req.auth). Authorization = decidir permisos (policy functions: canClaimRequest, canViewRequest). AuthN en middleware, AuthZ en policy/service.

IA: Bien. Repregunta: ¿Por qué canViewRequest devuelve 404 y no 403 para request ajeno?

Yo: Para no revelar existencia - security by obscurity. Un requester no debe saber si el ID existe pero es de otro, o no existe. Mismo código, mismo mensaje.

IA: Correcto. Clase 06 - Qué protege una prueba de integración vs una de unidad.

Yo: Test unitario = policy functions con objetos planos (sin HTTP, sin DB). Test integración = API completa con supertest (HTTP real, DB real). Unitario protege lógica de negocio, integración protege contratos HTTP y wiring.

IA: Bien. Clase 07 - Diferencia entre health y readiness. Ejemplo de cuándo cada uno falla.

Yo: Health = proceso vivo (GET /health = 200 siempre si el server corre). Readiness = listo para tráfico (GET /ready verifica DB). Health falla si el proceso crashea. Readiness falla si DB caído pero proceso vivo - Kubernetes usa readiness para sacar del load balancer.

IA: CORRECTO. 

--- CIERRE BLOQUE 1: RESULT_CODE ---
RESULT_CODE: PASS

--- CIERRE BLOQUE 2: JSON ---
{
  "studentId": "jacoborodriguez.itsu@gmail.com",
  "examVersion": "ITSU-KNOWLEDGE-01-07-1.0",
  "result": "PASS",
  "classes": {"01":"PASS","02":"PASS","03":"PASS","04":"PASS","05":"PASS","06":"PASS","07":"PASS"}
}

--- CIERRE BLOQUE 3: RESUMEN ---
Examen aprobado. Todas las clases con PASS. El estudiante demuestra comprensión sólida de middlewares, contratos HTTP, máquina de estados, transacciones, authN/authZ, testing y health/readiness.

--- CIERRE BLOQUE 4: AVISO DE EXPORTACIÓN ---
Exporta esta conversación completa como texto. Fin del examen.
```

## Metacognición (responde tú, después del examen)

1. ¿Qué pregunta o repregunta te costó más, y por qué crees que fue esa?

La repregunta de clase 05 sobre por qué 404 y no 403 - tuve que pensar en el principio de no revelar información de existencia. Me costó porque intuitivamente 403 parece más "correcto" para permisos.

2. Compara este resultado con tu reporte de evidencia: ¿coinciden? ¿Dónde difieren y qué te dice esa diferencia?

Coinciden - ambos PASS en las 7 clases. La diferencia es que el examen prueba explicación sin código delante, la evidencia prueba implementación real. Que ambos pasen da confianza de que no solo copié código sino que entiendo los conceptos.
