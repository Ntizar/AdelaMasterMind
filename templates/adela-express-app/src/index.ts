import express from 'express'
import { cargarConfiguracion } from './config.js'
import { configurarModulosAdela } from './setup.js'

// ---------------------------------------------------------------------------
// Punto de entrada del servidor Express con integración de módulos Adela
// TODO: Agregar middleware de logging (Morgan/Pino)
// TODO: Agregar manejo centralizado de errores
// TODO: Agregar tests de integración con supertest
// TODO: Configurar proceso de graceful shutdown (SIGTERM/SIGINT)
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // 1. Cargar configuración con patrón Adela_env
  const config = cargarConfiguracion()
  console.log(`[Adela] Configuración cargada desde variables de entorno.`)

  // 2. Crear aplicación Express
  const app = express()

  // Middleware global: parseo de JSON
  app.use(express.json())

  // 3. Configurar e integrar todos los módulos Adela
  const { db, authMiddleware, loginRouter, healthRouter, i18nMiddleware } =
    await configurarModulosAdela(app, config)

  console.log(`[Adela] Módulos inicializados correctamente.`)

  // -----------------------------------------------------------------------
  // Rutas públicas (sin autenticación)
  // -----------------------------------------------------------------------

  // 4. Endpoints de salud
  app.use(healthRouter)

  // 5. Ruta de login (pública)
  app.use(loginRouter)

  // Middleware de internacionalización (global, después de rutas públicas)
  app.use(i18nMiddleware)

  // -----------------------------------------------------------------------
  // Rutas estáticas públicas
  // -----------------------------------------------------------------------
  app.use('/public', express.static('public'))

  // -----------------------------------------------------------------------
  // Rutas protegidas (requieren autenticación)
  // -----------------------------------------------------------------------

  // 6. Middleware de autenticación — todo lo que sigue requiere token
  app.use('/api', authMiddleware)

  // TODO: Agregar rutas de la API aquí
  // Ejemplo: app.use('/api/usuarios', usuariosRouter)
  // Ejemplo: app.use('/api/datos', datosRouter)

  app.get('/api/ejemplo', (_req, res) => {
    res.json({ mensaje: 'Ruta protegida — autenticación válida.' })
  })

  // -----------------------------------------------------------------------
  // Ruta por defecto (404)
  // -----------------------------------------------------------------------
  app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
  })

  // -----------------------------------------------------------------------
  // Iniciar servidor
  // -----------------------------------------------------------------------
  const puerto = config.puerto

  app.listen(puerto, () => {
    console.log(`[Adela] Servidor iniciado en http://localhost:${puerto}`)
    console.log(`[Adela] Health check: http://localhost:${puerto}/health`)
    console.log(`[Adela] Ready check:  http://localhost:${puerto}/ready`)
    console.log(`[Adela] Login:        http://localhost:${puerto}/auth/login`)
    console.log(`[Adela] API pública:  http://localhost:${puerto}/public/`)
    console.log(`[Adela] API privada:  http://localhost:${puerto}/api/`)
  })
}

main().catch((error) => {
  console.error('[Adela] Error fatal al iniciar el servidor:', error)
  process.exit(1)
})