import { describe, it, expect } from 'vitest'
import { create{{MODULE_NAME}} } from '../src/module.js'

// ---------------------------------------------------------------------------
// Tests para el módulo adela-{{MODULE_NAME_LOWERCASE}}
// TODO: Agregar más tests según crezca la lógica del módulo
// ---------------------------------------------------------------------------

describe('adela-{{MODULE_NAME_LOWERCASE}}', () => {
  // Test 1: La factory create{{MODULE_NAME}}() devuelve un objeto con los métodos esperados
  it('debe crear una instancia con los métodos públicos esperados', () => {
    const instancia = create{{MODULE_NAME}}()

    expect(instancia).toBeDefined()
    expect(typeof instancia.iniciar).toBe('function')
    expect(typeof instancia.detener).toBe('function')
    expect(typeof instancia.obtenerEstado).toBe('function')
    expect(typeof instancia.obtenerConfiguracion).toBe('function')
  })

  // Test 2: El estado cambia correctamente al iniciar y detener
  it('debe transicionar entre estados correctamente', () => {
    const instancia = create{{MODULE_NAME}}()

    expect(instancia.obtenerEstado()).toBe('detenido')

    instancia.iniciar()
    expect(instancia.obtenerEstado()).toBe('activo')

    instancia.detener()
    expect(instancia.obtenerEstado()).toBe('detenido')
  })

  // Test 3: Las opciones se aplican correctamente
  it('debe aceptar opciones de configuración', () => {
    const nombrePersonalizado = 'mi-modulo-personalizado'
    const instancia = create{{MODULE_NAME}}({ nombre: nombrePersonalizado, habilitado: false })

    const config = instancia.obtenerConfiguracion()
    expect(config.nombre).toBe(nombrePersonalizado)
    expect(config.habilitado).toBe(false)
  })
})