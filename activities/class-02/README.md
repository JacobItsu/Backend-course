# Entrega 02 — HTTP como contrato

## Contenido de la carpeta

```
activities/class-02/
├── README.md
├── Actividad 1 - API Lite/
│   ├── package.json
│   ├── README.md
│   ├── server.js
│   └── lite-analysis.md
├── Actividad 2 - API Full/
│   ├── package.json
│   ├── README.md
│   ├── comparison.md
│   ├── ai-usage.md
│   ├── docs/
│   │   └── http-contract.md
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── routes/
│       │   └── requests.routes.js
│       └── data/
│           └── requests.js
└── activity resources/
    ├── request-api-lite/
    └── request-api-full-template/
```

## Actividad 1 — API Lite

Análisis independiente de una API existente con inconsistencias intencionales.

### Cómo ejecutar

```bash
cd "Actividad 1 - API Lite"
npm install
node server.js
```

### Defectos encontrados

1. Ruta `/getRequests` usa un verbo en lugar de sustantivo
2. `GET /requests/:id` devuelve 200 cuando el recurso no existe
3. `POST /requests` devuelve 200 en lugar de 201
4. Acepta creación sin campo `title`

## Actividad 2 — API Full

Construcción de una API con Express siguiendo un contrato HTTP definido.

### Cómo ejecutar

```bash
cd "Actividad 2 - API Full"
npm install
node src/server.js
```

### Endpoints implementados

- `GET /requests` → 200 con arreglo de solicitudes
- `GET /requests/:id` → 200 o 404
- `POST /requests` → 201 o 400

## Tags de entrega

- `class-02-lite-analysis` — Análisis del Lite antes de usar IA
- `class-02-submission` — Entrega final
