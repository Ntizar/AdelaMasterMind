# Adela Express App
> Aplicación Express preconfigurada con módulos Adela

## Descripción

Scaffold de proyecto Express que integra módulos Adela listos para usar:

- **Adela_db** — Base de datos SQLite
- **Adela_auth** — Autenticación y autorización
- **Adela_health** — Endpoints de salud (/health, /ready)
- **Adela_i18n** — Internacionalización con locale es-ES por defecto
- **Adela_env** — Configuración mediante variables de entorno

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalación

```bash
# Clonar o copiar el scaffold
cd adela-express-app
npm install

# Instalar módulos Adela (cuando estén publicados)
npm install adela-db adela-auth adela-health adela-i18n adela-env

# Configurar variables de entorno
cp .env.example .env
```

## Uso

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build && npm start
```

## Variables de Entorno

| Variable        | Descripción                     | Por Defecto       |
|-----------------|---------------------------------|--------------------|
| `PUERTO`        | Puerto del servidor Express     | `3000`             |
| `DB_RUTA`       | Ruta del archivo SQLite         | `./data/adela.db`  |
| `SECRETO_JWT`   | Secreto para firmar JWT         | `cambiar-en-prod`  |
| `LOCALE`        | Locale por defecto              | `es-ES`            |

## Endpoints

| Ruta          | Método | Auth | Descripción                  |
|---------------|--------|------|------------------------------|
| `/health`     | GET    | No   | Estado de la aplicación      |
| `/ready`      | GET    | No   | Readiness check              |
| `/auth/login` | POST   | No   | Inicio de sesión             |
| `/api/*`      | *      | Sí   | Rutas protegidas de la API   |
| `/public/*`   | *      | No   | Rutas públicas               |

## Licencia
MIT