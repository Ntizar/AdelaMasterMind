import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import express from 'express'
import type { Server } from 'http'

import { cargarConfiguracion } from '../src/config.js'
import { configurarModulosAdela } from '../src/setup.js'

// ---------------------------------------------------------------------------
// Tests de integración para la aplicación Express con módulos Adela
// TODO: Agregar tests para rutas protegidas con token
// TODO: Agregar tests para errores 404 y 500
// TODO: Agregar tests de i18n con diferentes headers Accept-Language
// ---------------------------------------------------------------------------

describe('adela-express-app', () => {
  let app: express.Express
  let servidor: Server
  const puerto = 0 // Puerto dinámico

  beforeAll(async () => {
    // Configurar variables de entorno para tests
    process.env.PUERTO = '0'
    process.env.DB_RUTA = ':memory:'
    process.env.SECRETO_JWT = 'test-secreto'
    process.env.LOCALE = 'es-ES'

    app = express()
    app.use(express.json())

    const config = cargarConfiguracion()
    const { authMiddleware, loginRouter, healthRouter, i18nMiddleware } =
      await configurarModulosAdela(app, config)

    // Montar rutas
    app.use(healthRouter)
    app.use(loginRouter)
    app.use(i18nMiddleware)
    app.use('/api', authMiddleware)

    app.get('/api/ejemplo', (_req, res) => {
      res.json({ mensaje: 'protegido' })
    })

    app.get('/public/test', (_req, res) => {
      res.json({ mensaje: 'público' })
    })

    // Iniciar servidor con puerto dinámico
    await new Promise<void>((resolve) => {
      servidor = app.listen(puerto, resolve)
    })
  })

  afterAll(() => {
    servidor?.close()
  })

  // Test 1: El endpoint /health responde correctamente
  it('debe responder /health con estado saludable', async () => {
    const respuesta = await fetch(`http://localhost:${(servidor.address() as any).port}/health`)
    expect(respuesta.status).toBe(200)

    const cuerpo = await respuesta.json()
    expect(cuerpo).toHaveProperty('estado', 'saludable')
    expect(cuerpo).toHaveProperty('timestamp')
  })

  // Test 2: El endpoint /ready responde correctamente
  it('debe responder /ready con estado listo', async () => {
    const respuesta = await fetch(`http://localhost:${(servidor.address() as any).port}/ready`)
    expect(respuesta.status).toBe(200)

    const cuerpo = await respuesta.json()
    expect(cuerpo).toHaveProperty('estado', 'listo')
  })

  // Test 3: Las rutas /api/* requieren autenticación
  it('debe rechazar /api/* sin token de autenticación', async () => {
    const respuesta = await fetch(
      `http://localhost:${(servidor.address() as any).port}/api/ejemplo`,
    )
    expect(respuesta.status).toBe(401)

    const cuerpo = await respuesta.json()
    expect(cuerpo).toHaveProperty('error')
  })

  // Test 4: Las rutas /public/* son accesibles sin autenticación
  it('debe permitir acceso a /public/* sin token', async () => {
    const respuesta = await fetch(
      `http://localhost:${(servidor.address() as any).port}/public/test`,
    )
    expect(respuesta.status).toBe(200)

    const cuerpo = await respuesta.json()
    expect(cuerpo.mensaje).toBe('público')
  })

  // Test 5: Las rutas inexistentes devuelven 404
  it('debe devolver 404 para rutas no encontradas', async () => {
    const respuesta = await fetch(
      `http://localhost:${(servidor.address() as any).port}/ruta-inexistente`,
    )
    expect(respuesta.status).toBe(404)
  })
})