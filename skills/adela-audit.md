---
name: adela-audit
description: Auditoría de calidad de módulos Adela — verifica que cumplen los estándares del ecosistema
---

# Skill: adela-audit

Auditoría de calidad de módulos Adela. Verifica que un módulo cumple con los estándares del ecosistema de piezas intercambiables.

---

## Uso

```bash
# Auditar un módulo específico
adela-audit modules/adela-health

# Auditar todos los módulos
adela-audit --all

# Auditar varios módulos específicos
adela-audit modules/adela-health modules/adela-auth modules/adela-i18n
```

---

## Checklist de auditoría

Cada ítem se marca como ✅ (aprobado), ❌ (fallo), o ➖ (no aplica).

### 1. ✅ TypeScript strict?

```bash
# Verificar que tsconfig.json tiene strict: true
grep -E '"strict":\s*true' modules/<módulo>/tsconfig.json
```

**Criterio:** `strict: true` debe estar presente en `compilerOptions`. Si está ausente o en `false`, el módulo no cumple.

### 2. ✅ package.json correcto?

```bash
# Verificar campos obligatorios
node -e "
const pkg = require('./modules/<módulo>/package.json');
const required = ['name', 'version', 'description', 'main', 'types', 'scripts'];
required.forEach(f => {
  if (!pkg[f]) console.log('❌ Falta: ' + f);
  else console.log('✅ Tiene: ' + f);
});
"
```

**Campos obligatorios:**
| Campo          | Descripción                            |
|----------------|----------------------------------------|
| `name`         | Debe empezar con `adela-`              |
| `version`      | SemVer (`0.1.0`, `1.0.0`, etc.)       |
| `description`  | En español                             |
| `main`         | `dist/index.js`                        |
| `types`        | `dist/index.d.ts`                      |
| `scripts.build`| `tsc`                                  |
| `scripts.test` | `vitest run` o `jest`                  |

### 3. ✅ Tests pasan?

```bash
cd modules/<módulo>
npm test
echo "Exit code: $?"
```

**Criterio:** Todos los tests deben pasar (exit code 0).

### 4. ✅ Build compila?

```bash
cd modules/<módulo>
rm -rf dist
npm run build
echo "Exit code: $?"

# Verificar que los archivos de salida existen
ls dist/index.js dist/index.d.ts 2>/dev/null && echo "✅ dist/ ok" || echo "❌ dist/ incompleto"
```

**Criterio:** Build exitoso + archivos `.js` y `.d.ts` generados.

### 5. ✅ README con Quick Start + API + Integración?

```bash
# Verificar secciones del README
for section in "Quick Start|quick.start|Instalacion|instalación" "API|api" "Integracion|integración" "Ejemplo|ejemplo"; do
  if grep -qiE "$section" modules/<módulo>/README.md 2>/dev/null; then
    echo "✅ README contiene sección: $(echo $section | cut -d'|' -f1)"
  else
    echo "❌ README falta sección: $(echo $section | cut -d'|' -f1)"
  fi
done
```

**Secciones mínimas del README:**
- Título y descripción del módulo
- Quick Start / Instalación
- API Reference (factory, opciones, métodos)
- Ejemplo de integración en Express
- Dependencias (si tiene)
- Licencia (MIT)

### 6. ✅ Zero deps o justificadas?

```bash
# Contar dependencias runtime
DEPS=$(node -e "const p=require('./modules/<módulo>/package.json');console.log(Object.keys(p.dependencies||{}).length)")
echo "Dependencias runtime: $DEPS"

if [ "$DEPS" -eq 0 ]; then
  echo "✅ Zero dependencias runtime"
else
  node -e "
    const p=require('./modules/<módulo>/package.json');
    Object.keys(p.dependencies||{}).forEach(d => console.log('   ➡️ ' + d));
  "
  echo "⚠️  Verificar que cada dependencia está justificada en README"
fi
```

**Criterio:** Ideal = 0 dependencias runtime. Si tiene, cada una debe estar justificada en el README.

### 7. ✅ TODO en castellano?

```bash
# Buscar código fuente para verificar idioma
cd modules/<módulo>

# Verificar que los comentarios están en español
echo "=== Comentarios en código ==="
grep -rn "//\|/\*" src/ 2>/dev/null | head -20

# Verificar que README está en español
if grep -qi "spanish|español|castellano|lenguaje" README.md 2>/dev/null; then
  echo "✅ README en español"
else
  # Detección heurística: palabras comunes en español
  if grep -qi "módulo|función|implementa|parámetro|devuelve|ruta" README.md 2>/dev/null; then
    echo "✅ README parece estar en español"
  else
    echo "⚠️  No se pudo confirmar idioma del README"
  fi
fi
```

**Criterio:** Código (comentarios, nombres de variables, mensajes de error) en **castellano** (español). README y documentación también en español.

### 8. ✅ registry.json actualizado en AdelaMasterMind?

```bash
# Verificar entrada en registry.json
node -e "
const registry = require('./registry.json');
const modName = require('./modules/<módulo>/package.json').name;
if (registry.modules && registry.modules[modName]) {
  console.log('✅ Entrada en registry.json para: ' + modName);
  console.log('   Estado: ' + (registry.modules[modName].status || 'sin estado'));
} else {
  console.log('❌ No hay entrada en registry.json para: ' + modName);
}
"
```

**Criterio:** El módulo debe tener una entrada en `registry.json` con los campos `name`, `description`, `version`, `path`, `status`, `factory`.

---

## Script de auditoría completo

Guarda esto como `scripts/audit-module.sh` en AdelaMasterMind:

```bash
#!/bin/bash
# Auditoría de módulo Adela
# Uso: ./scripts/audit-module.sh modules/adela-health

set -e

MODULE_PATH="$1"
MODULE_NAME=$(basename "$MODULE_PATH")
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✅${NC} $1"; }
fail() { echo -e "${RED}❌${NC} $1"; }
warn() { echo -e "${YELLOW}⚠️${NC} $1"; }

echo ""
echo "═══════════════════════════════════════════"
echo "  Auditoría Adela: $MODULE_NAME"
echo "═══════════════════════════════════════════"
echo ""

# 1. TypeScript strict
if grep -q '"strict":\s*true' "$MODULE_PATH/tsconfig.json" 2>/dev/null; then
  pass "TypeScript strict: true"
else
  fail "TypeScript strict: ausente o false"
fi

# 2. package.json
if [ -f "$MODULE_PATH/package.json" ]; then
  pass "package.json existe"
  node -e "
    const p = require('./$MODULE_PATH/package.json');
    const checks = {
      'name empieza con adela-': p.name && p.name.startsWith('adela-'),
      'version presente': !!p.version,
      'description en español': !!p.description,
      'main apunta a dist/index.js': p.main === 'dist/index.js',
      'types apunta a dist/index.d.ts': p.types === 'dist/index.d.ts',
      'scripts.build presente': !!(p.scripts && p.scripts.build),
      'scripts.test presente': !!(p.scripts && p.scripts.test),
    };
    Object.entries(checks).forEach(([k, v]) => {
      if (v) process.stdout.write('✅ ' + k + '\n');
      else process.stdout.write('❌ ' + k + '\n');
    });
  "
else
  fail "package.json no encontrado"
fi

# 3. Tests
if [ -d "$MODULE_PATH/test" ]; then
  TEST_COUNT=$(find "$MODULE_PATH/test" -name '*.test.ts' | wc -l)
  if [ "$TEST_COUNT" -ge 1 ]; then
    pass "Archivos de test encontrados: $TEST_COUNT"
    cd "$MODULE_PATH" && npm test -- --reporter=verbose 2>&1 | tail -5
    if [ $? -eq 0 ]; then
      pass "Tests pasan"
    else
      fail "Tests fallan"
    fi
  else
    fail "No hay archivos .test.ts en test/"
  fi
  cd - > /dev/null
else
  fail "Directorio test/ no existe"
fi

# 4. Build
cd "$MODULE_PATH"
rm -rf dist
npm run build 2>&1 | tail -3
if [ $? -eq 0 ] && [ -f "dist/index.js" ] && [ -f "dist/index.d.ts" ]; then
  pass "Build compila correctamente"
else
  fail "Build falla o dist/ incompleto"
fi
cd - > /dev/null

# 5. README
if [ -f "$MODULE_PATH/README.md" ]; then
  pass "README.md existe"
  for section in "Quick Start|quick.start|Instalacion|instalación" "API|api" "Integracion|integración" "Licencia|license|licencia"; do
    if grep -qiE "$section" "$MODULE_PATH/README.md" 2>/dev/null; then
      pass "  Sección presente: $(echo $section | cut -d'|' -f1)"
    else
      fail "  Falta sección: $(echo $section | cut -d'|' -f1)"
    fi
  done
else
  fail "README.md no existe"
fi

# 6. Dependencias
DEPS_COUNT=$(node -e "const p=require('./$MODULE_PATH/package.json');console.log(Object.keys(p.dependencies||{}).length)")
if [ "$DEPS_COUNT" -eq 0 ]; then
  pass "Zero dependencias runtime"
else
  warn "$DEPS_COUNT dependencia(s) runtime encontrada(s)"
  node -e "
    const p=require('./$MODULE_PATH/package.json');
    Object.keys(p.dependencies||{}).forEach(d => console.log('   ⤷ ' + d));
  "
fi

# 7. Español
SPANISH_WORDS="módulo|función|implementa|parámetro|devuelve|ruta|autenticación"
if grep -qiE "$SPANISH_WORDS" "$MODULE_PATH/README.md" 2>/dev/null; then
  pass "README en español"
else
  warn "No se detectó español en README (verificar manualmente)"
fi

# 8. registry.json
if [ -f "registry.json" ]; then
  node -e "
    const r = require('./registry.json');
    const n = require('./$MODULE_PATH/package.json').name;
    if (r.modules && r.modules[n]) {
      console.log('✅ Entrada en registry.json para: ' + n);
    } else {
      console.log('❌ Sin entrada en registry.json');
    }
  "
else
  fail "registry.json no encontrado en la raíz"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  Auditoría completada para $MODULE_NAME"
echo "═══════════════════════════════════════════"
```

---

## Formato para reportar resultados

Puedes generar un reporte en Markdown ejecutando:

```bash
./scripts/audit-module.sh modules/adela-health 2>&1 | tee audit-report.md
```

### Ejemplo de reporte

```markdown
# Auditoría Adela: adela-health

**Fecha:** 2026-06-15  
**Módulo:** modules/adela-health  
**Versión:** 0.1.0  

## Resultados

| Ítem                          | Estado |
|-------------------------------|--------|
| TypeScript strict             | ✅     |
| package.json correcto         | ✅     |
| Tests pasan                   | ✅     |
| Build compila                 | ✅     |
| README completo               | ✅     |
| Zero deps runtime             | ✅     |
| Código en español             | ✅     |
| registry.json actualizado     | ✅     |

**Puntuación:** 8/8 ✅ — Módulo listo para producción.

## Observaciones

- Sin dependencias runtime — cumple estándar zero-deps.
- README incluye Quick Start, API Reference y ejemplo de integración.
- Todos los tests pasan (8 tests).

---

**Auditoría realizada con adela-audit skill v1.0.0**
```

### Para reportar fallos:

```markdown
| Ítem                          | Estado |
|-------------------------------|--------|
| TypeScript strict             | ❌     |
| package.json correcto         | ✅     |
| Tests pasan                   | ❌     |
| Build compila                 | ✅     |
| README completo               | ❌     |
| Zero deps runtime             | ✅     |
| Código en español             | ✅     |
| registry.json actualizado     | ❌     |

**Puntuación:** 4/8 ❌ — Requiere correcciones.
```

---

## Acciones correctivas rápidas

| Problema                      | Solución                                      |
|-------------------------------|-----------------------------------------------|
| `strict: false`               | Cambiar a `strict: true` en tsconfig.json     |
| Tests fallan                  | Revisar `npm test` y corregir tests           |
| Build falla                   | Corregir errores de TypeScript en `npm run build` |
| README incompleto             | Añadir Quick Start, API, Integración, Licencia |
| Dependencias no justificadas  | Eliminarlas o documentar en README             |
| Sin entrada en registry.json  | Añadir entrada con nombre, versión, path, factory |
| Código en inglés              | Traducir comentarios y mensajes a español      |