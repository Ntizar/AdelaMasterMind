/**
 * Opciones de configuración para el módulo {{MODULE_NAME}}.
 *
 * TODO: Agregar aquí todas las opciones que el módulo necesite
 */
export interface Opciones{{MODULE_NAME}} {
  /** Nombre descriptivo de la instancia (por defecto: '{{MODULE_NAME_LOWERCASE}}') */
  nombre?: string

  /** Indica si el módulo debe iniciarse habilitado (por defecto: true) */
  habilitado?: boolean

  // TODO: Agregar opciones específicas del módulo aquí
  // Ejemplo: url?: string
  // Ejemplo: timeout?: number
  // Ejemplo: maxReintentos?: number
}

/**
 * Estados posibles del módulo.
 */
export type Estado{{MODULE_NAME}} = 'detenido' | 'activo' | 'error'

/**
 * Interfaz pública del módulo {{MODULE_NAME}}.
 *
 * Describe los métodos que expone la factory create{{MODULE_NAME}}().
 */
export interface {{MODULE_NAME}} {
  /** Inicializa el módulo y sus recursos */
  iniciar(): void

  /** Detiene el módulo y libera recursos */
  detener(): void

  /** Devuelve el estado actual del módulo */
  obtenerEstado(): Estado{{MODULE_NAME}}

  /** Devuelve una copia de la configuración actual */
  obtenerConfiguracion(): Opciones{{MODULE_NAME}}
}