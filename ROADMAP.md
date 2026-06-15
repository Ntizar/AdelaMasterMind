# Roadmap del Ecosistema Adela

> **Actualizado:** 14 Jun 2026
> **Estado:** 10/10 módulos base completados 🎉

## ✅ Completado (v1.0.0)

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

## 🔜 Siguiente (v1.1.0)

### AdelaMasterMind
- [ ] **AdelaMasterMind** — Meta-repositorio (este roadmap 😄)
- [ ] Skills Hermes Agent para trabajar con Adela
- [ ] Template de proyecto Express con Adela pre-integrado

### Adela_admin — Panel de control universal
- [ ] Middleware de tracking de visitas
- [ ] Dashboard de métricas (hoy, semana, mes)
- [ ] Integración con Adela_auth para login
- [ ] Frontend vanilla embebido en HTML

## 🧩 Planificación media (v1.2.0)

| Módulo | Descripción | Prioridad |
|--------|-------------|-----------|
| **Adela_config** | Config centralizada JSON/YAML + .env | Alta |
| **Adela_log** | Logging estructurado con niveles y rotación | Alta |
| **Adela_events** | Pub/sub en memoria para desacoplar módulos | Media |
| **Adela_queue** | Cola de trabajos (email, export, cleanup) | Media |
| **Adela_email** | Envío de emails con templates HTML | Media |

## 🌌 Visión lejana (v2.0.0)

| Módulo | Descripción |
|--------|-------------|
| **Adela_upload** | Subida de archivos con validación |
| **Adela_forms** | Generación + validación de formularios |
| **Adela_admin** | Panel admin completo con CRUD genérico |
| **Adela_cli** | CLI para scaffolding de proyectos Adela |
| **Adela_web** | Meta-framework para webs modulares con Adela |