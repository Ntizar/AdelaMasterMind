# Arquitectura del Ecosistema Adela

## Mapa de dependencias

```
  Capa Presentación
  ┌─────────────────────────────────────────────────────┐
  │  Adela_i18n     Adela_forms*    Adela_admin*        │
  └──────────┬──────────────────────────────────────────┘
             │ depende de
  Capa Core ─┼──────────────────────────────────────────┐
  │          ▼                                          │
  │  Adela_auth ───→ Adela_health ───→ Adela_cache      │
  │       │                                              │
  │       └──→ Adela_ai ───→ Adela_events*              │
  └──────────┬──────────────────────────────────────────┘
             │ depende de
  Capa Export ┼─────────────────────────────────────────┐
  │          ▼                                          │
  │  Adela_export ───→ Adela_email* ───→ Adela_queue*   │
  └──────────┬──────────────────────────────────────────┘
             │ depende de
  Capa Infra ┼──────────────────────────────────────────┐
  │          ▼                                          │
  │  Adela_db  ───→ Adela_cache  ───→ Adela_http        │
  │  Adela_env ───→ Adela_time                          │
  │  Adela_config*                                      │
  └─────────────────────────────────────────────────────┘

  * = En planificación
```

## Capas

### 🏗️ Capa Infra (base)
No dependen de ningún otro Adela. Son los cimientos.

| Módulo | Descripción |
|--------|-------------|
| **Adela_time** | Timezone Madrid, formateo, parseo ESIOS |
| **Adela_env** | Variables de entorno con validación |
| **Adela_http** | Cliente HTTP con retry/backoff/jitter |
| **Adela_cache** | Caché dual memory+disk |
| **Adela_db** | Abstracción SQLite con migraciones |

### ⚙️ Capa Core (funcional)
Usan módulos de infra para ofrecer funcionalidad de negocio.

| Módulo | Descripción |
|--------|-------------|
| **Adela_auth** | PIN + JWT + rate limiting. Usa Adela_db |
| **Adela_health** | Health checks Express. Usa Adela_time |
| **Adela_ai** | Proxy LLM (NaN/OpenRouter/OpenAI). Usa Adela_env |

### 📤 Capa Export (salida)
Generan archivos o envían datos.

| Módulo | Descripción |
|--------|-------------|
| **Adela_export** | CSV/JSON/PDF. Usa Adela_time |

### 🎨 Capa Presentación (interfaz)
Interactúan con el usuario o el navegador.

| Módulo | Descripción |
|--------|-------------|
| **Adela_i18n** | Internacionalización. No depende de nadie |
| **Adela_admin** | (Futuro) Panel admin universal |

## Principios arquitectónicos

1. **Dependencia unidireccional**: las flechas siempre apuntan de capa superior a inferior
2. **Nunca hacia arriba**: un módulo de infra NO puede depender de uno de core
3. **Aislables**: cada módulo funciona por sí solo (con sus deps runtime)
4. **Testeables**: con mock de las dependencias externas
5. **Sustituibles**: si `Adela_db` cambia de sql.js a better-sqlite3, nadie se entera