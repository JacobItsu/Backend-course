# Desarrollo Backend — Proyecto del curso

Repositorio con el proyecto transversal del curso de **Desarrollo Backend** (ITSU). Cada
clase entrega una actividad que se acumula sobre la anterior: el "proyecto transversal" se
construye clase a clase hasta el proyecto personal de fin de trimestre (carpeta `project/`).

**Autor:** Jacobo Rodríguez · `jacoborodriguez.itsu@gmail.com`

## Estructura

```
Backend-course/
├── README.md
├── project/                    → proyecto personal de fin de trimestre (reservado)
├── resources-notes/            → notas y material de apoyo
└── activities/
    ├── class-01/
    ├── class-02/
    ├── class-03/
    ├── class-04/
    ├── class-05/
    ├── class-06/
    └── class-08/
```

## Clases y entregas

| Clase | Tema | Tags de entrega | Estado |
| ----- | ---- | --------------- | ------ |
| [01 — El viaje de una petición](activities/class-01/) | Servidor HTTP en Node | — | ✅ |
| [02 — HTTP como contrato](activities/class-02/) | Análisis y construcción de una API (Express) | `class-02-lite-analysis`, `class-02-submission` | ✅ |
| [03 — Recursos, estado y reglas](activities/class-03/) | API de solicitudes con máquina de estados | `class-03-design`, `class-03-submission` | ✅ |
| [04 — Persistencia, integridad e historia](activities/class-04/) | Backend persistente en PostgreSQL (Supabase) | `class-04-design`, `class-04-submission` | ✅ |
| [05 — Autenticación, propiedad y permisos](activities/class-05/) | JWT, ownership y control de acceso | `class-05-submission` | ✅ |
| [06 — Tu primer ticket en un backend existente](activities/class-06/) | Corregir BUG-106, implementar FEATURE-206, validador final | `class-06-submission` | ✅ |
| [08 — El cambio pequeño que toca todo](activities/class-08/) | Refactor + FEATURE-801 claim, arquitectura route/service/store/policy | `class-08-submission` | ✅ |

## Recorrido del proyecto transversal

La misma entidad (**solicitudes de mantenimiento**) evoluciona a lo largo del curso:

1. **Clase 1** — un servidor HTTP básico en Node con rutas manuales y manejo de errores.
2. **Clase 2** — una API con Express: análisis de una API con defectos (Lite) y
   construcción de una API Full siguiendo un contrato HTTP.
3. **Clase 3** — la API pasa de "endpoints sueltos" a una API coherente: modelo de
   recursos, contrato HTTP, ciclo de vida protegido por una máquina de estados y la
   matriz de pruebas (10 casos).
4. **Clase 4** — el estado deja de vivir en memoria y pasa a **PostgreSQL (Supabase)**:
   tablas `requests` y `request_status_history`, transacciones, historial y la prueba de
   que los datos sobreviven al reinicio.
5. **Clase 5** — la capa de autenticación con JWT, el concepto de propiedad (owner)
   y la matriz de permisos: requesters vs agents con validación de credenciales
   y protección de rutas con middleware.
6. **Clase 6** — onboarding en un backend existente: comprender un código heredado,
   corregir una regresión (BUG-106), implementar un endpoint nuevo (FEATURE-206)
   y demostrar todo con un validador automático.
7. **Clase 8** — refactor del handler monolítico (GET /:id/history) a arquitectura
   route/service/store/policy, e implementación de FEATURE-801 (claim) con transacción
   consistente asignación+historial, validador de arquitectura (12 checks).

## Decisiones transversales

* **Sin `DELETE`**: el ciclo de vida de una solicitud termina en los estados terminales
  `closed` o `cancelled` (se conserva el historial). Documentado en `decision 001`.
* **Formato de error único**: `{ "error": { "code": "...", "message": "..." } }` en toda
  la API (a partir de la clase 3).
* **Diseño sin IA primero**: cada clase inicia con un cuestionario de diseño propio
  (sin IA) sellado con un tag `*-design`, antes de la implementación asistida.