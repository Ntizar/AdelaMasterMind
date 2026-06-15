---
name: adela-new-module
description: Scaffold y creación de nuevos módulos Adela siguiendo el ecosistema de piezas intercambiables
---

# Skill: adela-new-module

Guía para que un LLM cree un nuevo módulo Adela desde cero siguiendo el ecosistema de piezas intercambiables.

---

## Estructura final del módulo

```
adela-<nombre>/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── <nombre>.ts       # factory createX()
│   ├── types.ts           # interfaces y tipos
│   └── index.ts           # barrel export
├── test/
│   └── <nombre>.test.ts   # mínimo 8 tests
└── dist/                  # generado por build
```

---

## Paso 1: Copiar template scaffold

Usa la carpeta `scaffolds/templates/adela-module` como base. Si no existe, créala manualmente con la estructura anterior.

```bash
# Desde la raíz de AdelaMasterMind
cp -r scaffolds/templates/adela-module modules/adela-<nombre>
cd modules/adela-<nombre>
```

Template mínimo de `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test"]
}
```

---

## Paso 2: Rellenar package.json

```json
{
  "name": "adela-<nombre>",
  "version": "0.1.0",
  "description": "Módulo Adela para <funcionalidad>",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["adela", "<nombre>"],
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@types/node": "^20.11.0"
  }
}
```

**Reglas de dependencias:**
- `dependencies`: solo dependencias runtime estrictamente necesarias (zero-deps ideal)
- `devDependencies`: TypeScript, vitest, types
- Si necesita Express → `express` como peerDependency opcional

---

## Paso 3: Implementar src/<nombre>.ts (factory createX())

Toda factory debe llamarse `create<Nombre>()` y devolver un objeto con:
- `name`: string
- `router`: Express Router (si aplica)
- `middleware`: funciones middleware (si aplica)
- Métodos específicos del módulo

### Ejemplo: adela-health

```typescript
// src/health.ts
import { Router, Request, Response } from 'express';

export interface HealthOptions {
  endpoint?: string;
  version?: string;
}

export interface HealthModule {
  name: string;
  router: Router;
  getStatus: () => HealthStatus;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  uptime: number;
  timestamp: string;
}

export function createHealth(options: HealthOptions = {}): HealthModule {
  const {
    endpoint = '/health',
    version = '1.0.0',
  } = options;

  const startTime = Date.now();
  const router = Router();

  router.get(endpoint, (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      version,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  });

  return {
    name: 'adela-health',
    router,
    getStatus: () => ({
      status: 'ok',
      version,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    }),
  };
}
```

### Ejemplo: adela-auth

```typescript
// src/auth.ts
import { Router, Request, Response, NextFunction } from 'express';

export interface AuthOptions {
  secret: string;
  tokenExpiry?: number; // segundos, default 3600
}

export interface AuthModule {
  name: string;
  router: Router;
  authenticate: (req: Request, res: Response, next: NextFunction) => void;
  login: (username: string, password: string) => string | null; // token
}

interface UserPayload {
  id: string;
  username: string;
  role: string;
}

export function createAuth(options: AuthOptions): AuthModule {
  const { secret, tokenExpiry = 3600 } = options;
  const router = Router();

  // POST /auth/login
  router.post('/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    // ... lógica de verificación
    const token = jwt.sign({ username }, secret, { expiresIn: tokenExpiry });
    res.json({ token });
  });

  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // ... middleware JWT
    next();
  };

  return { name: 'adela-auth', router, authenticate, login: () => null };
}
```

### src/index.ts (barrel export)

```typescript
export { createHealth, HealthModule, HealthOptions, HealthStatus } from './health';
```

---

## Paso 4: Definir types.ts

Separa todas las interfaces y tipos en `src/types.ts` si el módulo es complejo. Para módulos pequeños, puede ir en el mismo archivo.

```typescript
// src/types.ts
export interface AdelaModule {
  name: string;
  version: string;
  dependencies?: string[];
}

export interface MiddlewareProvider {
  name: string;
  middleware: ((req: any, res: any, next: any) => void)[];
}

// Tipos específicos del módulo aquí...
```

---

## Paso 5: Tests — mínimo 8

Usa **vitest**. Los tests deben cubrir:

| # | Test | Descripción |
|---|------|-------------|
| 1 | Creación con opciones por defecto | `createHealth()` sin args |
| 2 | Creación con opciones personalizadas | `createHealth({ endpoint: '/status' })` |
| 3 | Router responde correctamente | GET al endpoint devuelve 200 |
| 4 | Estructura de respuesta correcta | body tiene status, version, uptime, timestamp |
| 5 | Error handling | Rutas inválidas devuelven 404 |
| 6 | Tipos exportados | Verificar que las interfaces existen |
| 7 | Compatibilidad con dependencias | Si usa auth, testear con db mock |
| 8 | Integración Express | Montar en app y hacer request real |

```typescript
// test/health.test.ts
import { describe, it, expect } from 'vitest';
import { createHealth } from '../src/health';
import express from 'express';
import request from 'supertest';

describe('adela-health', () => {
  it('should create module with default options', () => {
    const health = createHealth();
    expect(health.name).toBe('adela-health');
    expect(health.router).toBeDefined();
    expect(health.getStatus).toBeInstanceOf(Function);
  });

  it('should create module with custom endpoint', () => {
    const health = createHealth({ endpoint: '/status' });
    expect(health.router).toBeDefined();
  });

  it('should respond with 200 on health endpoint', async () => {
    const app = express();
    app.use(createHealth().router);
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('should return correct response structure', async () => {
    const app = express();
    app.use(createHealth({ version: '2.0.0' }).router);
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('version', '2.0.0');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 404 for unknown routes', async () => {
    const app = express();
    app.use(createHealth().router);
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });

  it('should provide accurate getStatus()', () => {
    const health = createHealth({ version: '1.0.0' });
    const status = health.getStatus();
    expect(status.status).toBe('ok');
    expect(status.version).toBe('1.0.0');
    expect(typeof status.uptime).toBe('number');
  });

  it('should handle multiple instances', () => {
    const h1 = createHealth({ endpoint: '/health1' });
    const h2 = createHealth({ endpoint: '/health2' });
    expect(h1.name).toBe(h2.name);
    expect(h1.router).not.toBe(h2.router);
  });

  it('should integrate with Express app correctly', async () => {
    const app = express();
    const health = createHealth({ endpoint: '/api/health' });
    app.use(health.router);
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

Ejecutar tests:

```bash
npm test
# o
npx vitest run
```

---

## Paso 6: Verificar build + tests

```bash
# Limpiar build anterior
rm -rf dist

# Compilar TypeScript
npm run build

# Verificar que dist/ existe y tiene los archivos
ls dist/

# Ejecutar tests
npm test

# Verificar lint (si existe)
npm run lint 2>/dev/null || echo "Sin linter configurado"
```

El build debe producir:
- `dist/index.js`
- `dist/index.d.ts`
- `dist/<nombre>.js`
- `dist/<nombre>.d.ts`
- `dist/types.js` (si existe)
- `dist/types.d.ts` (si existe)

---

## Paso 7: Añadir a registry.json en AdelaMasterMind

Agrega una entrada en `registry.json` en la raíz de AdelaMasterMind:

```json
{
  "modules": {
    "adela-<nombre>": {
      "name": "adela-<nombre>",
      "description": "Módulo Adela para <funcionalidad>",
      "version": "0.1.0",
      "path": "modules/adela-<nombre>",
      "status": "active",
      "dependencies": [],
      "factory": "create<Nombre>",
      "tags": ["adela", "<nombre>"],
      "createdAt": "<YYYY-MM-DD>"
    }
  }
}
```

**Reglas del registry:**
- `status`: `"active"`, `"deprecated"`, o `"experimental"`
- `dependencies`: lista de otros módulos adela-* que necesita
- `factory`: nombre exacto de la función factory
- No duplicar entradas — verificar que el nombre no exista

---

## Paso 8: Push a GitHub

```bash
# Desde la raíz de AdelaMasterMind
git add modules/adela-<nombre>/
git add registry.json

# Mensaje de commit descriptivo
git commit -m "feat(modules): añadir módulo adela-<nombre> - <descripción breve>"

# Push a la rama correspondiente
git push origin <rama>
```

---

## Checklist de calidad

- [ ] `package.json` tiene `name`, `version`, `main`, `types`, `scripts`
- [ ] `tsconfig.json` tiene `strict: true`
- [ ] Factory `create<Nombre>()` devuelve objeto con `name` y `router`
- [ ] `src/index.ts` exporta todo lo público
- [ ] Mínimo 8 tests unitarios (vitest)
- [ ] Todos los tests pasan (`npm test`)
- [ ] Build compila sin errores (`npm run build`)
- [ ] `registry.json` actualizado en AdelaMasterMind
- [ ] README.md con Quick Start, API Reference, ejemplos de integración
- [ ] Código y comentarios en **castellano** (español)
- [ ] Zero dependencias runtime o cada dependencia justificada en README
- [ ] Push exitoso a GitHub