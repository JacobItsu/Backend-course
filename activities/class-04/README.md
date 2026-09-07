# Entrega 04 · Persistencia, integridad e historia

> Metodología de la clase: **análisis propio (fase 1, sin IA) → tag `class-04-design` →
> implementación asistida (fase 2) → verificación (fase 5) → tag `class-04-submission`.**
> Backend persistente en **PostgreSQL (Supabase)**: el array en memoria de la clase 3 pasa a
> tablas sin romper el contrato HTTP v3.

## Entregables

| Archivo | Contenido |
| ------- | --------- |
| `resource-model.md` | Modelo persistente (tablas `requests` y `request_status_history`) |
| `http-contract.md` | Contrato HTTP de la API v4 (v3 + `GET /requests/:id/history`) |
| `transition-map.md` | Mapa de transiciones (mismo dominio que clase 3 + eventos en historial) |
| `test-matrix.md` | Matriz de prueba: 9 casos obligatorios + 2 propios, con evidencia |
| `ai-usage.md` | Registro honesto del uso de IA (dónde se usó y dónde no) |
| `reflection.md` | Reflexión personal del proceso |
| `project/` | Implementación (ver su `README.md`) |

## Proyecto

La implementación vive en [`project/`](project/README.md): API de solicitudes de
mantenimiento persistida en PostgreSQL (Supabase) con transacciones e historial. Ver su
README para ejecutar y la nota sobre el pooler.

## Cómo fue el proceso

1. **Fase 1 (sin IA):** cuestionario de diseño respondido por el estudiante.
2. **Commit + tag `class-04-design`:** sella el diseño antes de implementar (con IA).
3. **Fase 2 (con IA):** implementación en `project/` a partir del starter de la clase 4;
   se aplicaron los refinamientos del análisis (índice del historial, `SELECT ... FOR UPDATE`,
   eventos de historial con `id`/`requestId`).
4. **Fase 5 (verificación):** matriz ejecutada con `curl` contra Supabase real (11/11),
   incluida la prueba definitoria *sobrevive al reinicio*.
5. **Commit + tag `class-04-submission`:** entrega final, sincronizada con GitHub.

## Conclusión de la clase

- La base de datos ahora protege las invariantes que en la clase 3 protegía el código
  (`CHECK`, `NOT NULL`, `DEFAULT`); el historial registra cada transición dentro de la misma
  transacción.
- El `project/` raíz queda **reservado** para el proyecto personal de fin de trimestre.