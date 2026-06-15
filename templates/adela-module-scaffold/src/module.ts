import type { Opciones{{MODULE_NAME}}, {{MODULE_NAME}}, Estado{{MODULE_NAME}} } from './types.js'

/**
 * Crea una nueva instancia del módulo {{MODULE_NAME}}.
 *
 * Factory function que devuelve un objeto con los métodos públicos.
 * No requiere dependencias externas — solo TypeScript nativo.
 *
 * @param opciones - Configuración opcional del módulo
 * @returns Instancia de {{MODULE_NAME}}
 *
 * TODO: Implementar la lógica específica del módulo
 * TODO: Agregar manejo de errores con Adela_error
 * TODO: Escribir tests unitarios para cada método público
 * TODO: Documentar en castellano todos los parámetros
 */
export function create{{MODULE_NAME}}(opciones?: Opciones{{MODULE_NAME}}): {{MODULE_NAME}} {
  // TODO: Validar opciones al iniciar
  const opcionesFinales: Opciones{{MODULE_NAME}} = {
    nombre: '{{MODULE_NAME_LOWERCASE}}',
    habilitado: true,
    ...opciones,
  }

  let iniciado = false
  let estado: Estado{{MODULE_NAME}} = 'detenido'

  /**
   * Inicia el módulo.
   * TODO: Implementar la lógica de inicialización
   * TODO: Verificar que las dependencias estén disponibles
   */
  function iniciar(): void {
    if (iniciado) {
      // TODO: Lanzar advertencia en lugar de error silencioso
      console.warn(`[adela-{{MODULE_NAME_LOWERCASE}}] El módulo ya está iniciado.`)
      return
    }

    // TODO: Conectar recursos, abrir conexiones, etc.
    iniciado = true
    estado = 'activo'
    console.log(`[adela-{{MODULE_NAME_LOWERCASE}}] Módulo "${opcionesFinales.nombre}" iniciado.`)
  }

  /**
   * Detiene el módulo de forma limpia.
   * TODO: Cerrar conexiones, liberar recursos, guardar estado
   */
  function detener(): void {
    if (!iniciado) {
      console.warn(`[adela-{{MODULE_NAME_LOWERCASE}}] El módulo ya está detenido.`)
      return
    }

    // TODO: Limpiar recursos antes de detener
    iniciado = false
    estado = 'detenido'
    console.log(`[adela-{{MODULE_NAME_LOWERCASE}}] Módulo "${opcionesFinales.nombre}" detenido.`)
  }

  /**
   * Devuelve el estado actual del módulo.
   */
  function obtenerEstado(): Estado{{MODULE_NAME}} {
    return estado
  }

  /**
   * Devuelve la configuración actual (solo lectura).
   * TODO: Considerar si exponer datos sensibles
   */
  function obtenerConfiguracion(): Opciones{{MODULE_NAME}} {
    return { ...opcionesFinales }
  }

  return {
    iniciar,
    detener,
    obtenerEstado,
    obtenerConfiguracion,
  }
}