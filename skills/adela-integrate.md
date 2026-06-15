---
name: adela-integrate
description: Integrar uno o varios módulos Adela en un proyecto web Express
---

# Skill: adela-integrate

Guía para integrar uno o varios módulos Adela en un proyecto Express existente.

---

## Visión general

Los módulos Adela son piezas intercambiables. Cada uno exporta una factory `create<Nombre>()` que devuelve un objeto con:

| Propiedad     | Tipo                  | Obligatorio | Descripción                     |
|---------------|-----------------------|-------------|---------------------------------|
| `name`        | `string`              | ✅          | Identificador del módulo        |
| `router`      | `express.Router`      | ✅          | Rutas Express a montar          |
| `middleware`  | `Middleware[]`        | ❌          | Middlewares adicionales         |
| Otros métodos | `Function`            | ❌          | Métodos específicos del módulo  |

---

## Paso 1: npm install de los módulos necesarios

```bash
# Desde la raíz del proyecto Express
npm install adela-health adela-auth adela-i18n adela-admin
```

Si los módulos están en un monorepo o registro privado:

```bash
npm install @adela/health @adela/auth @adela/i18n @adela/admin
```

**Usar un path local durante desarrollo:**

```bash
npm install ../AdelaMasterMind/modules/adela-health
```

---

## Paso 2: Importar y configurar con createX()

Cada módulo se importa individualmente y se configura con su factory.

```typescript
// src/index.ts — ejemplo completo
import express from 'express';
import { createHealth } from 'adela-health';
import { createAuth } from 'adela-auth';
import { createI18n } from 'adela-i18n';
import { createAdmin } from 'adela-admin';
import { createDb } from 'adela-db'; // dependencia de auth

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### Patrón: instanciar con opciones

```typescript
// Configuración de cada módulo
const health = createHealth({
  endpoint: '/health',
  version: '2.1.0',
});

const db = createDb({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/miapp',
});

const auth = createAuth({
  secret: process.env.JWT_SECRET || 'change-me',
  tokenExpiry: 7200, // 2 horas
  db, // ← inyección de dependencia
});

const i18n = createI18n({
  defaultLocale: 'es',
  supportedLocales: ['es', 'en', 'ca', 'eu', 'gl'],
  fallbackLocale: 'en',
});

const admin = createAdmin({
  basePath: '/admin',
  auth, // ← inyección de dependencia
  db,   // ← inyección de dependencia
  i18n, // ← inyección de dependencia (para panel multilingüe)
});
```

---

## Paso 3: Conectar dependencias entre módulos

Algunos módulos Adela requieren otros. Pásalos explícitamente como opciones (inyección de dependencias).

### Ejemplo: adela-auth necesita adela-db

```typescript
// ❌ Incorrecto — auth no sabe cómo crear su propia DB
const auth = createAuth({ secret: '...' });

// ✅ Correcto — se inyecta la dependencia
const db = createDb({ uri: '...' });
const auth = createAuth({ secret: '...', db });
```

### Ejemplo: adela-admin necesita adela-auth + adela-i18n

```typescript
const admin = createAdmin({
  basePath: '/admin',
  auth,    // para proteger rutas admin
  i18n,    // para traducciones del panel
  db,      // para consultar usuarios/roles
});
```

### Grafo de dependencias típico

```
adela-admin ──→ adela-auth ──→ adela-db
                                    ↑
adela-i18n ────────────────────────┘
                                    ↑
adela-health (sin dependencias) ────┘
```

---

## Paso 4: Ejemplo completo — auth + health + i18n + admin

```typescript
// src/index.ts — integración completa
import express from 'express';
import { createHealth } from 'adela-health';
import { createAuth } from 'adela-auth';
import { createI18n } from 'adela-i18n';
import { createAdmin } from 'adela-admin';
import { createDb } from 'adela-db';

const app = express();
app.use(express.json());

// 1. Capa de datos
const db = createDb({
  uri: process.env.DB_URI || 'mongodb://localhost:27017/adela_app',
});

// 2. Internacionalización
const i18n = createI18n({
  defaultLocale: 'es',
  supportedLocales: ['es', 'en'],
});

// 3. Autenticación (depende de db)
const auth = createAuth({
  secret: process.env.JWT_SECRET!,
  db,
  tokenExpiry: 3600,
});

// 4. Health check (sin dependencias)
const health = createHealth({
  endpoint: '/health',
  version: '1.0.0',
});

// 5. Panel de administración (depende de auth, db, i18n)
const admin = createAdmin({
  basePath: '/admin',
  auth,
  db,
  i18n,
});

// 6. Middleware de i18n — detectar locale en cada request
app.use(i18n.middleware);

// 7. Montar routers de módulos
app.use(health.router);              // GET /health
app.use(auth.router);                // POST /auth/login, POST /auth/register
app.use('/api', auth.authenticate);  // proteger rutas /api/*
app.use(admin.router);               // GET /admin/*

// 8. Ruta de ejemplo protegida con auth
app.get('/api/perfil', auth.authenticate, (req, res) => {
  const t = i18n.t(req); // función de traducción para el request
  res.json({
    mensaje: t('bienvenido', { nombre: (req as any).usuario?.nombre }),
  });
});

// 9. Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Adela corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: POST http://localhost:${PORT}/auth/login`);
  console.log(`🛠️  Admin: http://localhost:${PORT}/admin`);
});
```

---

## Paso 5: Patrón típico — app.use(router), app.use(middleware)

```typescript
// Patrón estándar para montar routers Adela
app.use(health.router);              // rutas del módulo
app.use(auth.router);                // rutas del módulo
app.use('/admin', admin.router);     // prefijo opcional

// Middleware de módulo para proteger rutas
app.use('/api', auth.authenticate);  // proteger todo /api/*
app.use('/admin', auth.authenticate);// proteger /admin/*

// Múltiples middlewares de distintos módulos
app.use(
  i18n.middleware,        // inyectar locale
  audit.middleware,       // log de auditoría
  rateLimit.middleware,   // rate limiting
);
```

### Organización típica en proyectos grandes

```
src/
├── index.ts              # bootstrap + app.listen()
├── app.ts                # configuración de Express + montaje de módulos
├── config/
│   └── modules.ts        # fábrica de módulos Adela (createX() calls)
├── routes/
│   └── api.ts            # rutas propias de la aplicación
└── middleware/
    └── error.ts          # error handler global
```

```typescript
// src/config/modules.ts
import { createHealth } from 'adela-health';
import { createAuth } from 'adela-auth';
import { createDb } from 'adela-db';

export function buildModules() {
  const db = createDb({ uri: process.env.DB_URI! });
  const health = createHealth({ version: '1.0.0' });
  const auth = createAuth({ secret: process.env.JWT_SECRET!, db });
  return { db, health, auth };
}
```

```typescript
// src/app.ts
import express from 'express';
import { buildModules } from './config/modules';
import apiRoutes from './routes/api';

export function createApp() {
  const app = express();
  const { health, auth } = buildModules();

  app.use(express.json());
  app.use(health.router);
  app.use(auth.router);
  app.use('/api', auth.authenticate, apiRoutes);

  return app;
}
```

---

## Paso 6: Verificación final

### Prueba manual con curl

```bash
# Health check
curl http://localhost:3000/health
# → {"status":"ok","version":"1.0.0","uptime":42,"timestamp":"..."}

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secreto"}'
# → {"token":"eyJhbGci..."}

# Ruta protegida
curl http://localhost:3000/api/perfil \
  -H "Authorization: Bearer <token>"
# → {"mensaje":"Bienvenido, admin"}

# Panel admin
curl http://localhost:3000/admin/
# → HTML del panel de administración
```

### Prueba automatizada con vitest / supertest

```typescript
// test/integration.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Integración Adela', () => {
  const app = createApp();

  it('health endpoint funciona', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('auth login funciona', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'secreto' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('ruta protegida requiere token', async () => {
    const res = await request(app).get('/api/perfil');
    expect(res.status).toBe(401);
  });
});
```

### Checklist de verificación

- [ ] Todos los módulos instalados (`npm list | grep adela`)
- [ ] Dependencias entre módulos inyectadas correctamente
- [ ] Routers montados con `app.use()`
- [ ] Middleware de autenticación aplicado donde corresponde
- [ ] `i18n.middleware` se ejecuta antes de las rutas que usan `i18n.t()`
- [ ] Servidor arranca sin errores
- [ ] Health endpoint responde 200
- [ ] Login/Auth endpoint responde 200
- [ ] Rutas protegidas rechazan requests sin token
- [ ] Panel admin carga correctamente
- [ ] Tests de integración pasan