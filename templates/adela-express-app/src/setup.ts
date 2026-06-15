import type { Express, Router, RequestHandler } from 'express'

import type { Configuracion } from './config.js'

// ---------------------------------------------------------------------------
// Configuración e inicialización de módulos Adela
//
// Estas importaciones son ilustrativas — el usuario instala los módulos
// Adela_real cuando estén disponibles.
//
// TODO: Reemplazar stubs por las importaciones reales:
//   import { createDatabase } from 'adela-db'
//   import { createAuth, authRouter } from 'adela-auth'
//   import { createHealthRouter } from 'adela-health'
//   import { createI18n } from 'adela-i18n'
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Interfaces para los módulos Adela (stubs tipados)
// ---------------------------------------------------------------------------

interface BaseDeDatos {
  ejecutar(sql: string, params?: unknown[]): Promise<unknown>
  cerrar(): Promise<void>
}

interface Autenticacion {
  verificarToken(token: string): { valido: boolean; usuario?: string }
  generarToken(usuario: string): string
}

interface EnrutadorLogin extends Router {}
interface EnrutadorSalud extends Router {}

interface Internacionalizacion {
  traducir(clave: string, locale?: string): string
  localePorDefecto: string
}

// ---------------------------------------------------------------------------
// Módulos stub — implementaciones mínimas para que el scaffold funcione
// sin dependencias externas instaladas. Reemplazar por módulos reales.
// ---------------------------------------------------------------------------

function crearBaseDeDatosStub(dbRuta: string): BaseDeDatos {
  console.log(`[Adela_db] Base de datos SQLite configurada en: ${dbRuta}`)
  // TODO: Implementar con better-sqlite3 o sql.js
  return {
    ejecutar: async (sql) => {
      console.log(`[Adela_db] Consulta ejecutada: ${sql}`)
      return []
    },
    cerrar: async () => {
      console.log('[Adela_db] Conexión cerrada.')
    },
  }
}

function crearAutenticacionStub(secreto: string, db: BaseDeDatos): Autenticacion {
  console.log(`[Adela_auth] Autenticación configurada con secreto: ${secreto.slice(0, 4)}...`)
  // TODO: Implementar verificación real contra la base de datos
  return {
    verificarToken: (token) => {
      // Stub: cualquier token que empiece con "ok-" es válido
      const valido = token.startsWith('ok-')
      return { valido, usuario: valido ? token.replace('ok-', '') : undefined }
    },
    generarToken: (usuario) => `ok-${usuario}-${Date.now()}`,
  }
}

function crearRutaLoginStub(auth: Autenticacion): EnrutadorLogin {
  const { Router } = require('express')
  const router = Router()

  // TODO: Implementar validación de credenciales real
  router.post('/auth/login', (req, res) => {
    const { usuario, contraseña } = req.body || {}
    if (usuario && contraseña) {
      const token = auth.generarToken(usuario)
      res.json({ token, usuario })
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' })
    }
  })

  return router
}

function crearRutaSaludStub(db: BaseDeDatos): EnrutadorSalud {
  const { Router } = require('express')
  const router = Router()

  router.get('/health', (_req, res) => {
    res.json({ estado: 'saludable', timestamp: new Date().toISOString() })
  })

  router.get('/ready', async (_req, res) => {
    try {
      await db.ejecutar('SELECT 1')
      res.json({ estado: 'listo', db: 'conectada' })
    } catch {
      res.status(503).json({ estado: 'no listo', db: 'desconectada' })
    }
  })

  return router
}

function crearInternacionalizacionStub(locale: string): Internacionalizacion {
  // TODO: Implementar con i18next o similar
  console.log(`[Adela_i18n] Internacionalización configurada con locale: ${locale}`)
  return {
    traducir: (clave) => {
      // Stub: devuelve la clave como valor
      return clave
    },
    localePorDefecto: locale,
  }
}

// ---------------------------------------------------------------------------
// Middleware de i18n — inyecta función t() en req
// ---------------------------------------------------------------------------
function crearMiddlewareI18nStub(i18n: Internacionalizacion): RequestHandler {
  return (req, _res, next) => {
    // Asigna la función de traducción al objeto req
    ;(req as any).t = (clave: string) => i18n.traducir(clave, req.headers['accept-language'])
    ;(req as any).locale = i18n.localePorDefecto
    next()
  }
}

// ---------------------------------------------------------------------------
// Middleware de autenticación — protege rutas /api/*
// ---------------------------------------------------------------------------
function crearMiddlewareAuthStub(auth: Autenticacion): RequestHandler {
  return (req, res, next) => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' })
      return
    }
    const token = header.slice(7)
    const resultado = auth.verificarToken(token)
    if (!resultado.valido) {
      res.status(401).json({ error: 'Token inválido' })
      return
    }
    // Inyectar información del usuario en la request
    ;(req as any).usuario = resultado.usuario
    next()
  }
}

// ---------------------------------------------------------------------------
// Interfaz de retorno de configurarModulosAdela
// ---------------------------------------------------------------------------
export interface ModulosAdela {
  db: BaseDeDatos
  auth: Autenticacion
  authMiddleware: RequestHandler
  loginRouter: EnrutadorLogin
  healthRouter: EnrutadorSalud
  i18n: Internacionalizacion
  i18nMiddleware: RequestHandler
}

/**
 * Configura e inicializa todos los módulos Adela en la aplicación Express.
 *
 * @param app  - Instancia de Express
 * @param config - Configuración cargada desde variables de entorno
 * @returns Objeto con todos los módulos y middlewares listos para usar
 */
export async function configurarModulosAdela(
  app: Express,
  config: Configuracion,
): Promise<ModulosAdela> {
  // 1. Inicializar base de datos
  const db = crearBaseDeDatosStub(config.dbRuta)

  // 2. Configurar autenticación
  const auth = crearAutenticacionStub(config.secretoJwt, db)
  const authMiddleware = crearMiddlewareAuthStub(auth)
  const loginRouter = crearRutaLoginStub(auth)

  // 3. Configurar health checks
  const healthRouter = crearRutaSaludStub(db)

  // 4. Configurar internacionalización
  const i18n = crearInternacionalizacionStub(config.locale)
  const i18nMiddleware = crearMiddlewareI18nStub(i18n)

  console.log('[Adela] Todos los módulos configurados e inicializados.')

  return {
    db,
    auth,
    authMiddleware,
    loginRouter,
    healthRouter,
    i18n,
    i18nMiddleware,
  }
}