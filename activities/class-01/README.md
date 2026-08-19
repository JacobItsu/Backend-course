# Entrega 01 - El viaje de una petición

## Instrucciones para ejecutar

1. Asegúrate de tener Node.js instalado (versión 14 o superior).
2. Abre una terminal en la carpeta `src/`.
3. Ejecuta el servidor:
   ```bash
   node server.js
   ```
4. Abre el navegador y visita:
   - `http://localhost:3000/` - Página de bienvenida
   - `http://localhost:3000/health` - Endpoint de salud
   - `http://localhost:3000/api/info` - Información del servidor en JSON
   - `http://localhost:3000/cualquier-ruta` - Respuesta 404
5. Para detener el servidor, presiona `Ctrl+C` en la terminal.

## Diagrama del recorrido de una petición

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Usuario   │      │  Navegador  │      │   Servidor  │
│  (humano)   │      │  (cliente)  │      │  (Node.js)  │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                    │
       │  1. Escribe URL    │                    │
       │───────────────────>│                    │
       │                    │                    │
       │                    │  2. Crea petición  │
       │                    │  HTTP y la envía   │
       │                    │  al puerto 3000    │
       │                    │───────────────────>│
       │                    │                    │
       │                    │  3. Servidor       │
       │                    │  recibe la petición│
       │                    │  y ejecuta la      │
       │                    │  función handler   │
       │                    │                    │
       │                    │  4. Inspiciona     │
       │                    │  request.url       │
       │                    │                    │
       │                    │  5. Decide qué     │
       │                    │  responder según   │
       │                    │  la ruta           │
       │                    │                    │
       │                    │  6. Envía respuesta│
       │                    │  con estado, tipo  │
       │                    │  y contenido       │
       │                    │<───────────────────│
       │                    │                    │
       │  7. Muestra el     │                    │
       │  resultado en      │                    │
       │  pantalla          │                    │
       │<───────────────────│                    │
       │                    │                    │
```

## Explicación de una falla diagnosticada

**Falla elegida:** fault-5 (asignación en lugar de comparación)

### Comportamiento observado
Al acceder a cualquier ruta del servidor, siempre se devolvía el mismo contenido, independientemente de la ruta solicitada. Incluso rutas inventadas como `/ruta-inexistente` mostraban la respuesta de la ruta `/`.

### Hipótesis inicial
La ruta no se estaba comparando correctamente con la URL recibida, posiblemente por un error de sintaxis en la condición.

### Evidencia revisada
1. En la terminal, el servidor mostraba que recibía diferentes rutas (`GET /`, `GET /health`, `GET /ruta-inexistente`).
2. En el navegador, todas las rutas mostraban el mismo contenido.
3. En la pestaña Network del navegador, todas las respuestas tenían estado 200.

### Causa encontrada
En la condición `if (request.url = '/health')` se usaba el operador de asignación `=` en lugar del operador de comparación `===`. Esto causaba que la condición siempre fuera verdadera, asignando `/health` a `request.url` y ejecutando ese bloque siempre.

### Modificación realizada
Cambiar el operador de asignación por el de comparación:
```javascript
// Antes (incorrecto)
if (request.url = '/health') {

// Después (correcto)
if (request.url === '/health') {
```

### Resultado
Después de la corrección, cada ruta respondía con su contenido específico: `/` con el mensaje de bienvenida, `/health` con "OK" y `/api/info` con el JSON. Las rutas inexistentes devolvían 404.

### Explicación final
El error fue un operador equivocado en la comparación de rutas. El signo `=` asigna un valor y siempre devuelve verdadero, mientras que `===` compara valores estrictamente. Este tipo de error es difícil de detectar porque el código no produce errores de sintaxis, pero cambia completamente el comportamiento del programa.

## Respuestas al ticket de salida

### 1. ¿Qué es frontend y qué es backend? ¿Cuál es la diferencia esencial?

**Frontend** es la parte de una aplicación que se ejecuta en el navegador del usuario y muestra la interfaz visual. **Backend** es un programa distinto que vive en otra máquina o proceso, recibe solicitudes y decide qué responder.

La diferencia esencial es **dónde se ejecuta** y **quién toma las decisiones**: el frontend se ejecuta en el navegador del usuario y muestra lo que el backend le envía; el backend se ejecuta en un servidor y decide qué datos enviar.

### 2. ¿Por qué un archivo de Node.js puede quedarse ejecutando indefinidamente?

Porque el método `server.listen()` mantiene el proceso activo y escuchando peticiones en un puerto. A diferencia de un script que termina cuando llega al final, un servidor HTTP se queda esperando indefinidamente para poder recibir y responder solicitudes de clientes.

### 3. ¿Qué instrumento usarías para saber si el servidor está funcionando?

La **terminal** donde se ejecuta el servidor. Si el proceso está activo y muestra mensajes de conexión, significa que está funcionando. También puedo usar el navegador para hacer una petición y ver si recibo respuesta.

### 4. ¿Qué pasos ocurren desde que el usuario escribe una URL hasta que ve el resultado?

1. El usuario escribe una URL en el navegador.
2. El navegador crea una petición HTTP.
3. La petición se envía al puerto especificado (ej: 3000).
4. El servidor Node.js recibe la petición.
5. El programa inspecciona la URL (request.url).
6. El programa decide qué respuesta producir según la ruta.
7. El servidor completa la respuesta con estado, tipo y contenido.
8. El navegador recibe y presenta el resultado al usuario.

### 5. Si el navegador no muestra nada, ¿cómo sabes si el problema es del servidor o del cliente?

Miro la terminal del servidor:
- Si el servidor está activo y muestra que recibió la petición, el problema está del lado del servidor (quizás la respuesta no se está cerrando correctamente).
- Si el servidor no está activo o no muestra nada, el problema está antes: el servidor no está ejecutándose o el puerto es incorrecto.

## Profundización

### Recurso elegido: "Anatomy of an HTTP Transaction" (Node.js)

1. **Concepto nuevo encontré:** La estructura completa de una transacción HTTP, incluyendo cómo se separan las partes de la solicitud (método, URL, headers, body) y de la respuesta (estado, headers, body).

2. **Cómo se relaciona con el servidor que construí:** En mi servidor, estoy manipulando estas partes exactamente: uso `request.method` y `request.url` para inspeccionar la solicitud, y `response.writeHead()` para definir el estado y headers de la respuesta.

3. **Parte que todavía no comprendo:** No entiendo completamente cómo se maneja el body de las peticiones POST, ya que en esta clase solo trabajé con peticiones GET.

4. **Evidencia o experimento para investigarla:** Podría modificar mi servidor para que acepte peticiones POST en una ruta específica (por ejemplo, `/api/data`) y usar la herramienta Network del navegador o `curl` para enviar datos y ver cómo se reciben.

## AI usage

- **Si utilizé IA:** Sí.
- **Para qué la utilicé:** Para revisar la estructura del servidor HTTP y confirmar que estaba usando correctamente el módulo `http` de Node.js.
- **Qué sugerencia acepté:** La sugerencia de usar `JSON.stringify()` para convertir el objeto a texto antes de enviarlo como respuesta JSON.
- **Qué sugerencia rechacé o modifiqué:** Rechacé la sugerencia de agregar middleware de logging, ya que la clase pide un log básico hecho manualmente.
- **Cómo comprobé el resultado:** Ejecuté el servidor y probé cada ruta en el navegador, verificando que las respuestas fueran las esperadas y que los logs aparecieran correctamente en la terminal.
