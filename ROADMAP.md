# Roadmap del Ecosistema Adela

> **Actualizado:** 14 Jun 2026
> **Estado:** 10/10 módulos base completados 🎉

## ✅ Completado (v1.1.0)

### Fase 1 — P0 (Infraestructura base)
- [x] **Adela_time** — Timezone Madrid + parseo
- [x] **Adela_env** — Variables de entorno
- [x] **Adela_http** — Cliente HTTP

### Fase 2 — P1 (Funcionalidad core)
- [x] **Adela_cache** — Caché dual
- [x] **Adela_health** — Health checks
- [x] **Adela_auth** — Autenticación completa

### Fase 3 — P2 (Exportación e IA)
- [x] **Adela_export** — CSV/JSON/PDF
- [x] **Adela_ai** — Proxy LLM
- [x] **Adela_db** — Abstracción de base de datos

### Fase 4 — P3 (Internacionalización)
- [x] **Adela_i18n** — Locales + formatos Intl

### Fase 5 — Admin y Meta
- [x] **Adela_admin** — Panel admin universal con tracking de visitas y dashboard
- [x] **AdelaMasterMind** — Meta-repositorio con registry + skills + templates

## 🔜 Siguiente (v1.2.0)

### Adela_config — Configuración centralizada
- [ ] Config en JSON/YAML con validación
- [ ] Merge con .env automático
- [ ] Schemas tipados

### Adela_log — Logging estructurado
- [ ] Niveles: debug, info, warn, error
- [ ] Salida a consola + archivo con rotación
- [ ] Formato JSON para producción

### Adela_events — Sistema pub/sub en memoria
- [ ] Desacoplar módulos mediante eventos
- [ ] Suscripciones con filtro por tipo
- [ ] Útil para notificar cambios entre módulos

## 🧩 Planificación media (v1.3.0)

| Módulo | Descripción | Prioridad |
|--------|-------------|-----------|
| **Adela_queue** | Cola de trabajos (email, export, cleanup) | Media |
| **Adela_email** | Envío de emails con templates HTML | Media |
| **Adela_upload** | Subida de archivos con validación | Baja |
| **Adela_forms** | Generación + validación de formularios | Baja |

## 🌌 Visión lejana (v2.0.0)

| Módulo | Descripción |
|--------|-------------|
| **Adela_cli** | CLI para scaffolding de proyectos Adela |
| **Adela_web** | Meta-framework para webs modulares con Adela |
| **CI/CD** | GitHub Actions para tests + publish automático |
| **NPM publish** | Publicar todos los módulos en npm |