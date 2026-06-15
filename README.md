# 🧩 AdelaMasterMind

> **El centro de control del ecosistema Adela** — registro central, filosofía, skills y templates para construir webs modulares con piezas intercambiables.

---

## ¿Qué es Adela?

Adela es un **ecosistema de módulos TypeScript** diseñados como piezas de puzzle. Cada pieza resuelve un problema concreto (auth, caché, base de datos, exportación...) y todas encajan porque comparten:

- **TypeScript strict** como lengua franca
- **Zero-deps runtime** siempre que es posible
- **API coherente**: `createX(config?) → X`, `async/await`
- **Castellano**: nombres, comentarios, errores, README
- **Tests obligatorios**

---

## 📦 Los 10 módulos

| Módulo | Tests | Deps | ¿Qué hace? |
|--------|-------|------|------------|
| 🕐 **Adela_time** | 46 | 0 | Timezone Madrid + parseo |
| 🌱 **Adela_env** | 8 | 0 | Variables de entorno con validación |
| 🌐 **Adela_http** | 20 | 0 | Cliente HTTP con retry/backoff |
| 💾 **Adela_cache** | 35 | 0 | Caché dual memoria + disco |
| ❤️ **Adela_health** | 30 | 0 | Health checks + Express router |
| 🔐 **Adela_auth** | 46 | bcrypt+jwt+sql | PIN + JWT + rate limiting |
| 📤 **Adela_export** | 38 | csv+pdfkit | CSV, JSON y PDF |
| 🤖 **Adela_ai** | 21 | 0 | Proxy LLM (NaN/OpenRouter/OpenAI) |
| 🗄️ **Adela_db** | 17 | sql.js | Abstracción SQLite + migraciones |
| 🌍 **Adela_i18n** | 38 | 0 | Locales JSON + Intl API |

> **~300 tests, 0 fallos, 10 repos públicos**

---

## 📁 Estructura de este repositorio

```
AdelaMasterMind/
├── ADELA.md              # Filosofía, convenciones, estándares del ecosistema
├── ARCHITECTURE.md       # Mapa visual de dependencias entre módulos
├── registry.json         # Registro central — fuente de verdad legible por máquinas
├── ROADMAP.md            # Plan de desarrollo del ecosistema
├── skills/               # Skills para LLMs (Hermes Agent)
│   ├── adela-new-module.md   # Cómo crear un nuevo módulo Adela
│   ├── adela-integrate.md    # Cómo integrar Adela en un proyecto
│   └── adela-audit.md        # Cómo auditar la calidad de un módulo
└── templates/            # Scaffolds para crear proyectos
    ├── adela-module-scaffold/   # Plantilla para nuevo módulo
    └── adela-express-app/      # Proyecto Express con Adela pre-integrado
```

---

## 🚀 Quick Start

```bash
# Clonar el meta-repo
git clone https://github.com/Ntizar/AdelaMasterMind.git
cd AdelaMasterMind

# Ver el registro central
cat registry.json | jq '.modules[].id'

# Crear un nuevo módulo (los LLMs lo hacen automáticamente con el skill)
# cp -r templates/adela-module-scaffold/ ../Adela_mi_modulo/

# O crear un proyecto Express completo
# cp -r templates/adela-express-app/ ../mi-proyecto/
```

---

## 🤖 Cómo usar con LLMs

Este repositorio está diseñado para que **LLMs como Mastermind** lo lean y entiendan cómo trabajar con Adela:

1. **ADELA.md** → El LLM aprende la filosofía y estándares
2. **registry.json** → El LLM sabe qué módulos existen y cómo se relacionan
3. **skills/** → Skills de Hermes Agent que el LLM ejecuta para crear/integrar/auditar
4. **templates/** → Plantillas que el LLM copia para proyectos

Flujo típico con un LLM:
```
Usuario: "Necesito una web con login y panel admin"
LLM → lee ADELA.md → lee registry.json → carga skill adela-integrate
   → selecciona módulos (Adela_auth + Adela_db + Adela_admin)
   → los configura en Express siguiendo la arquitectura
   → los conecta y verifica con tests
```

---

## 🧠 Filosofía en una frase

> **"Cada pieza resuelve un problema, todas encajan sin fricción, y un LLM puede orquestarlas sin pensar."**

---

Hecho con ❤️ por David Antizar