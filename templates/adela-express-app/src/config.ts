// ---------------------------------------------------------------------------
// Configuración usando patrón Adela_env
// Lee variables de entorno con valores por defecto sensatos
// TODO: Agregar validación de variables requeridas (joi, zod, etc.)
// TODO: Agregar soporte para archivo .env (dotenv)
// TODO: Agregar tipado estricto para cada variable
// ---------------------------------------------------------------------------

export interface Configuracion {
  /** Puerto del servidor Express */
  puerto: number

  /** Ruta del archivo de base de datos SQLite */
  dbRuta: string

  /** Secreto para firmar tokens JWT */
  secretoJwt: string

  /** Locale por defecto para i18n */
  locale: string
}

/**
 * Carga la configuración desde variables de entorno.
 * Los valores se leen con el prefijo ADELA_ siempre que sea posible.
 *
 * @returns Objeto Configuracion con valores tipados
 */
export function cargarConfiguracion(): Configuracion {
  return {
    puerto: obtenerNumero('PUERTO', 3000),
    dbRuta: obtenerCadena('DB_RUTA', './data/adela.db'),
    secretoJwt: obtenerCadena('SECRETO_JWT', 'cambiar-en-prod'),
    locale: obtenerCadena('LOCALE', 'es-ES'),
  }
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function obtenerCadena(clave: string, porDefecto: string): string {
  return process.env[clave] ?? porDefecto
}

function obtenerNumero(clave: string, porDefecto: number): number {
  const valor = process.env[clave]
  if (valor === undefined || valor === '') return porDefecto
  const numero = Number(valor)
  return Number.isNaN(numero) ? porDefecto : numero
}