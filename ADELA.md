# ADELA.md — Filosofía del Ecosistema Adela

> **Versión:** 1.0.0
> **Creado:** 14 Jun 2026
> **Autor:** David Antizar (Ntizar)
> **Propósito:** Guía para LLMs y desarrolladores sobre cómo construir, integrar y mantener módulos Adela.

---

## 1. Filosofía

Adela es un **ecosistema de piezas de puzzle intercambiables**. Cada módulo es una herramienta independiente que resuelve un problema concreto, pero todas encajan entre sí porque hablan el mismo idioma:

- **TypeScript strict** como lengua franca
- **Zero-deps runtime** siempre que sea posible
- **API coherente**: `createX(config?) → X`, `async/await`, tipos compartidos
- **Tests obligatorios**: mínimo 8 tests por módulo, ideal 20+
- **Castellano**: nombres, comentarios, errores, README — TODO en español

Un proyecto que use Adela simplemente **elige qué piezas del puzzle necesita** y las conecta. Sin fricción, sin acoplamiento, sin reinventar la rueda.

---

## 2. Stack técnico

| Aspecto | Estándar |
|---------|----------|
| Lenguaje | TypeScript (strict mode) |
| Módulos | ESM (`"type": "module"`) |
| Target | ES2022 |
| Test runner | `tsx --test` (Node test runner nativo) |
| Build | `tsc` → `dist/` |
| Formato | `package.json` con `main`, `types`, `exports` |
| Dependencias | **Zero runtime si es posible**. Si no, mínimas y justificadas |

---

## 3. Convenciones

### 3.1 Nombres

- Módulos: `Adela_<nombre>` (PascalCase con guión bajo)
- Archivos: `kebab-case.ts`
- Clases: PascalCase
- Funciones: camelCase
- Variables: camelCase
- Constantes: UPPER_SNAKE_CASE solo para valores mágicos
- Interfaces: PascalCase sin prefijo `I`

### 3.2 Estructura de un módulo

```
Adela_<nombre>/
├── README.md              # Obligatorio: Quick Start + API + Integración
├── package.json           # name: "adela-<nombre>"
├── tsconfig.json          # Strict, ES2022, Node16 module resolution
├── src/
│   ├── index.ts           # Barrel export (exporta todo)
│   ├── <nombre>.ts        # Implementación principal
│   └── types.ts           # Interfaces y tipos públicos
├── tests/
│   └── <nombre>.test.ts   # Tests con node:test
└── dist/                  # Generado por tsc
```

### 3.3 API

Cada módulo exporta:

1. **Factory function**: `createX(config?) → Promise<X>` (o sincrónica si no necesita I/O)
2. **Clase**: `class X` con métodos async donde aplique
3. **Tipos**: `interface XConfig`, `interface XResult`, etc.
4. **Función auxiliar** si añade valor (`isX()`, `formatX()`, etc.)

Ejemplo:
```typescript
// Crear instancia
const cache = await createCache({ tipo: 'memory', ttlMs: 60_000 })

// Usar
await cache.set('clave', { datos: 'valor' })
const valor = await cache.get('clave')
const stats = cache.getStats()
```

### 3.4 README

Todo README debe tener:

```markdown
# Adela_<nombre>
> Descripción

## Instalación
\`\`\`bash
npm install adela-<nombre>
\`\`\`

## Quick Start
[... 5 líneas como mucho]

## API
[Firma de cada función exportada con una línea de descripción]

## Integración con otros Adela
[Qué otros módulos usa y cómo se conectan]

## Tests
\`\`\`bash
npm test
\`\`\`
```

---

## 4. Dependencias entre módulos

```
Adela_db ←─────── Adela_auth ──────→ Adela_admin
    ↑                   ↑
Adela_cache ──── Adela_http ──── Adela_ai
    ↑                   ↑
Adela_env ────── Adela_time ──── Adela_export
                    ↑                   ↑
                Adela_i18n ──────── Adela_health
```

**Reglas:**
- Las flechas apuntan **hacia la dependencia** (`A → B` significa `A` usa `B`)
- Un módulo **nunca depende de uno de capa superior**
- `Adela_env` y `Adela_time` no dependen de nadie (base del ecosistema)
- `Adela_admin` puede depender de cualquiera

---

## 5. Cómo crear un nuevo módulo Adela

1. Copiar `templates/adela-module-scaffold/` → `Adela_<nombre>/`
2. Rellenar `package.json` (nombre, descripción, dependencias)
3. Implementar en `src/<nombre>.ts` con `createX()` como entry point
4. Definir tipos en `src/types.ts`
5. Exportar todo desde `src/index.ts`
6. Escribir tests (mínimo 8)
7. Verificar: `npm test && npm run build`
8. Añadir al `registry.json` del AdelaMasterMind
9. Push a GitHub

---

## 6. Skills para LLMs

Los skills en `skills/` enseñan a LLMs (como Mastermind) cómo:

- **`adela-new-module`**: Scaffold de módulo nuevo siguiendo estas convenciones
- **`adela-integrate`**: Cómo conectar módulos Adela en un proyecto Express
- **`adela-audit`**: Auditoría de calidad: ¿el módulo cumple los estándares?

Cada skill sigue el formato estándar de Hermes Agent (SKILL.md con frontmatter).

---

## 7. registry.json

El `registry.json` es la **fuente de verdad** del ecosistema. Todo script o LLM que quiera saber qué hay disponible lo lee aquí. Contiene:

- Lista completa de módulos con versiones
- Estado (stable/beta/draft)
- Dependencias
- Tests
- URL de GitHub
- API pública (funciones exportadas)

Mantenerlo actualizado es responsabilidad del creador/añadidor del módulo.

---

## 8. Filosofía de diseño

> **"Un módulo, una responsabilidad"**

- Si empiezas a poner "y además" en la descripción → dividir
- Si el módulo necesita 3 dependencias runtime → replantear
- Si los tests tardan más de 10s → optimizar
- Si el README tiene más de 100 líneas → resumir

> **"Todo en castellano, porque aquí el dueño habla castellano"**

- Código, commits, issues, PRs → español
- API pública → español (nombres de funciones, parámetros, errores)
- README → español (aunque se puede añadir versión inglés)

> **"Zero-deps es un ideal, no un dogma"**

- `Adela_auth` necesita bcrypt → tiene deps, y está bien
- `Adela_export` necesita PDFKit → tiene deps, y está bien
- Pero si puedes hacerlo con `fetch()` nativo en vez de `axios` → hazlo