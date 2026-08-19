# Entrega 02 — HTTP como contrato

## Contenido de la carpeta

```
activities/class-02/
├── README.md                      ← Este archivo
├── lite-api/                      ← API Lite original (con bugs)
│   ├── package.json
│   ├── README.md
│   └── server.js
├── project/                       ← Proyecto Full completo
│   ├── package.json
│   ├── README.md
│   ├── docs/
│   │   └── http-contract.md       ← Contrato HTTP definido antes del código
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── routes/
│       │   └── requests.routes.js ← Endpoints implementados
│       └── data/
│           └── requests.js        ← Datos en memoria
├── lite-analysis.md               ← Análisis independiente del Lite
├── comparison.md                  ← Comparación Lite vs Full
├── ai-usage.md                    ← Documento de uso de IA
└── activity resources/            ← Archivos originales de la presentación
```

## Cómo instalar y ejecutar

### API Lite

```bash
cd lite-api
npm install
node server.js
```

### Proyecto Full

```bash
cd project
npm install
node src/server.js
```

Ambos servidores corren en `http://localhost:3000`.

## Defectos encontrados en el Lite

1. **Ruta con verbo:** `/getRequests` usa un verbo en lugar de un sustantivo. Debería ser `/requests`.
2. **Estado incoherente:** `GET /requests/:id` devuelve 200 cuando el recurso no existe, con un body que indica error.
3. **Código de creación incorrecto:** `POST /requests` devuelve 200 en lugar de 201.
4. **Sin validación:** Acepta creación de solicitudes sin campo `title`.

## Decisiones tomadas en el Full

- **Contrato definido antes del código:** Se escribió `http-contract.md` primero como guía de implementación.
- **Estructura modular:** Separación de responsabilidades entre server, app, routes y data.
- **Validación server-side:** El campo `title` se valida en el servidor y devuelve 400 si falta.
- **Códigos de estado correctos:** 201 para creación, 404 para recursos inexistentes, 400 para datos inválidos.
- **Exclusiones respetadas:** Sin base de datos, sin PUT/PATCH/DELETE, sin autenticación, sin frontend.
