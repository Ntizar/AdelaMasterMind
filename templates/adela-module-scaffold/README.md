# Adela_{{MODULE_NAME}}
> {{MODULE_DESCRIPTION}}

## Instalación
npm install adela-{{MODULE_NAME_LOWERCASE}}

## Quick Start

```typescript
import { create{{MODULE_NAME}} } from 'adela-{{MODULE_NAME_LOWERCASE}}'

const instancia = create{{MODULE_NAME}}({
  // opciones de configuración
})

instancia.iniciar()
```

## API

### `create{{MODULE_NAME}}(opciones?: Opciones{{MODULE_NAME}}): {{MODULE_NAME}}`
Crea una nueva instancia del módulo.

### Métodos principales

| Método | Descripción |
|--------|-------------|
| `iniciar()` | Inicializa el módulo |
| `detener()` | Detiene el módulo limpiamiente |
| `estado()` | Devuelve el estado actual |

## Licencia
MIT