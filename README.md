<![CDATA[<div align="center">

# 🔧 Tecnilink

**Plataforma de Gestión de Soporte Técnico**

![Node.js](https://img.shields.io/badge/Node.js-≥20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## 📋 Descripción

Tecnilink es una plataforma web académica para gestionar solicitudes de soporte técnico. El sistema permite que **clientes** creen solicitudes, **técnicos** atiendan casos asignados y **administradores** gestionen usuarios, categorías, solicitudes y métricas. Incluye un rol **Super Admin** para administración global.

El proyecto está organizado como un **monorepo** con frontend y backend separados, autenticación con JWT y Google OAuth, verificación de identidad via RENIEC, tres modos de asignación de trabajo, sistema de notificaciones en tiempo real, auditoría completa y subida de avatares con Cloudinary.

---

## 🏗️ Tecnologías

<table>
<tr>
<td width="50%">

### Frontend
- React 18 con Vite
- Tailwind CSS 3
- React Router 6
- Axios
- Framer Motion
- Lucide React (iconos)
- Radix UI (Dialog, Dropdown)
- Sonner (toasts)
- Google OAuth (`@react-oauth/google`)

</td>
<td width="50%">

### Backend
- Node.js ≥ 20
- Express 4
- Prisma 6 + PostgreSQL (Neon)
- JWT + Google Auth Library
- Bcrypt + Zod
- Cloudinary (avatares)
- Multer (upload)
- Helmet, CORS, Rate Limit
- Winston + Morgan (logs)

</td>
</tr>
</table>

---

## 📁 Estructura del proyecto

```text
Tecnilink/
├── client/                    # Frontend React + Vite
│   └── src/
│       ├── components/        # Componentes reutilizables
│       │   └── ui/            # Componentes base (Button, Card, Dialog, etc.)
│       ├── context/           # AuthContext (manejo de sesión)
│       ├── layouts/           # PublicLayout, PrivateLayout
│       ├── pages/             # Todas las páginas de la app
│       ├── routes/            # Router y ProtectedRoute
│       ├── services/          # API client (Axios)
│       └── utils/             # Utilidades compartidas
├── server/                    # Backend Express
│   ├── prisma/                # Schema, migraciones y seed
│   └── src/
│       ├── config/            # env.js, prisma.js, logger.js, cloudinary.js
│       ├── controllers/       # Controladores por recurso
│       ├── middlewares/       # Auth, roles, upload, validación, errores
│       ├── routes/            # Definición de rutas
│       ├── schemas/           # Validación con Zod
│       ├── services/          # Lógica de negocio
│       └── utils/             # Helpers (paginación, errores, async)
├── load-tests/                # Scripts k6 para pruebas de carga
├── docs/                      # Documentación adicional
└── LandingpageTecnilink/      # Landing page estática
```

---

## ⚙️ Variables de entorno

### Backend (`server/.env`)

Crea un archivo `.env` en `server/` basándote en `.env.example`:

```env
# Servidor
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Base de datos
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"

# Autenticación
JWT_SECRET="clave-larga-y-segura-minimo-16-caracteres"
JWT_EXPIRES_IN=2h
BCRYPT_SALT_ROUNDS=10

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id.apps.googleusercontent.com"

# RENIEC / Factiliza (verificación de DNI para técnicos)
RENIEC_API_BASE_URL=https://api.factiliza.com/v1/dni/info
RENIEC_API_TOKEN="tu-token-de-factiliza"

# Cloudinary (avatares de perfil)
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# Rate Limiting
LOGIN_RATE_LIMIT_WINDOW_MS=600000
LOGIN_RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300

# Logs
ENABLE_REQUEST_LOGS=true
```

`FRONTEND_URL` acepta múltiples URLs separadas por coma:

```env
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID="tu-google-client-id.apps.googleusercontent.com"
```

---

## 🚀 Instalación y ejecución

```bash
# 1. Instalar dependencias del backend
cd server
npm install

# 2. Instalar dependencias del frontend
cd ../client
npm install

# 3. Generar cliente Prisma
cd ../server
npm run prisma:generate

# 4. Aplicar migraciones
npm run prisma:migrate -- --name init

# 5. Ejecutar seed inicial
npm run prisma:seed

# 6. Iniciar backend (terminal 1)
npm run dev

# 7. Iniciar frontend (terminal 2)
cd ../client
npm run dev
```

| Servicio | URL |
|----------|-----|
| Backend API | `http://localhost:4000` |
| Frontend | `http://localhost:5173` |
| Prisma Studio | `npm run prisma:studio` en `server/` |

---

## 👥 Roles del sistema

| Rol | Descripción |
|-----|-------------|
| `SUPER_ADMIN` | Administración global: métricas, gestión de admins y auditoría |
| `ADMIN` | Gestiona categorías, asigna técnicos, configura modos de asignación |
| `TECNICO` | Atiende solicitudes asignadas, toma trabajos disponibles |
| `CLIENTE` | Crea y da seguimiento a solicitudes de soporte |

---

## 🔐 Autenticación

### Registro de cliente

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente Demo","email":"cliente@test.com","password":"Tecnilink123!"}'
```

El registro público siempre crea usuarios con rol `CLIENTE`.

### Registro de técnico (con verificación RENIEC)

```bash
curl -X POST http://localhost:4000/api/auth/register-technician \
  -H "Content-Type: application/json" \
  -d '{"name":"Técnico","email":"tecnico@test.com","password":"Tecnilink123!","dni":"12345678"}'
```

El DNI se valida contra la API de RENIEC/Factiliza. El nombre se toma automáticamente de la respuesta oficial de RENIEC. Este endpoint tiene rate limit propio (5 consultas/minuto).

### Login tradicional

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@test.com","password":"Tecnilink123!"}'
```

### Login con Google OAuth

```bash
curl -X POST http://localhost:4000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"credential":"google-id-token"}'
```

Si el usuario no existe, se crea automáticamente como `CLIENTE`. Si ya existe, se vincula el `googleId`.

### Consultar usuario autenticado

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Usuarios del seed

El seed crea usuarios de prueba. Todos usan la contraseña: `Tecnilink123!`

| Rol | Datos del seed |
|-----|---------------|
| SUPER_ADMIN | 1 super administrador |
| ADMIN | 1 administrador |
| TECNICO | 2 técnicos |
| CLIENTE | 3 clientes |

También crea 4 categorías, 10 solicitudes y comentarios de ejemplo.

---

## 📂 API — Categorías

Todas requieren token JWT.

| Método | Ruta | Permiso |
|--------|------|---------|
| `GET` | `/api/categories?page=1&limit=10` | ADMIN, CLIENTE, TECNICO |
| `POST` | `/api/categories` | ADMIN |
| `PUT` | `/api/categories/:id` | ADMIN |
| `DELETE` | `/api/categories/:id` | ADMIN |

`DELETE` realiza borrado lógico (`isActive=false`).

---

## 📋 API — Solicitudes técnicas

Todas requieren token JWT.

| Método | Ruta | Permiso |
|--------|------|---------|
| `GET` | `/api/requests?page=1&limit=10` | ADMIN ve todas · CLIENTE ve propias · TECNICO ve asignadas |
| `POST` | `/api/requests` | CLIENTE |
| `GET` | `/api/requests/:id` | Usuario relacionado o ADMIN |
| `PUT` | `/api/requests/:id` | ADMIN o CLIENTE propietario (si PENDIENTE/DISPONIBLE) |
| `PATCH` | `/api/requests/:id/assign` | ADMIN |
| `PATCH` | `/api/requests/:id/status` | TECNICO asignado |
| `DELETE` | `/api/requests/:id` | ADMIN o CLIENTE propietario (si PENDIENTE/DISPONIBLE) |
| `GET` | `/api/requests/technicians/list` | ADMIN, SUPER_ADMIN |
| `GET` | `/api/requests/available` | TECNICO |
| `POST` | `/api/requests/:id/take` | TECNICO |
| `POST` | `/api/requests/:id/release` | TECNICO |

### Filtros disponibles

```text
status=PENDIENTE|DISPONIBLE|EN_PROCESO|ATENDIDA|CANCELADA
priority=BAJA|MEDIA|ALTA
categoryId=ID_DE_CATEGORIA
```

### Estados del flujo

```text
PENDIENTE ──→ EN_PROCESO ──→ ATENDIDA
    │              │
    ▼              ▼
CANCELADA    CANCELADA (solo admin)

DISPONIBLE ──→ EN_PROCESO ──→ ATENDIDA
    │              │
    ▼              ▼
CANCELADA    DISPONIBLE (release)
```

- **PENDIENTE**: Estado inicial en modo `MANUAL`. Admin asigna técnico.
- **DISPONIBLE**: Estado inicial en modo `SELF_ASSIGNMENT`. Técnicos toman trabajos.
- **EN_PROCESO**: Técnico asignado trabajando en el caso.
- **ATENDIDA**: Caso resuelto.
- **CANCELADA**: Caso cancelado por cliente o admin.

---

## 💬 API — Comentarios

| Método | Ruta | Permiso |
|--------|------|---------|
| `GET` | `/api/requests/:id/comments?page=1&limit=10` | ADMIN, cliente propietario, técnico asignado |
| `POST` | `/api/requests/:id/comments` | ADMIN, cliente propietario, técnico asignado |

---

## 👤 API — Perfil

Todas requieren token JWT.

| Método | Ruta | Permiso |
|--------|------|---------|
| `GET` | `/api/profile/me` | Autenticado |
| `PATCH` | `/api/profile/me` | Autenticado |
| `POST` | `/api/profile/avatar` | Autenticado |

**Campos editables por rol:**

- **CLIENTE / ADMIN**: `name`, `phone`, `bio`
- **TECNICO**: `phone`, `bio`, `specialty`, `experienceYears`, `serviceArea` (no puede editar `name` porque es dato oficial de RENIEC)

El avatar se sube a **Cloudinary** mediante `multipart/form-data`.

Si un técnico tiene DNI verificado pero faltan datos de RENIEC (usuarios legacy), el perfil realiza un **backfill automático** consultando la API de RENIEC.

---

## 🔔 API — Notificaciones

Todas requieren token JWT.

| Método | Ruta | Permiso |
|--------|------|---------|
| `GET` | `/api/notifications` | Autenticado |
| `PUT` | `/api/notifications/read` | Autenticado |

Las notificaciones se generan automáticamente cuando:
- Se asigna automáticamente un trabajo a un técnico (modo `AUTO`)
- Un trabajo queda disponible en la especialidad del técnico (modo `SELF_ASSIGNMENT`)
- Un técnico libera un trabajo y vuelve a la cola
- El motor de escalamiento sube la prioridad de un caso idle

---

## ⚡ API — Configuración de empresa

| Método | Ruta | Permiso |
|--------|------|---------|
| `GET` | `/api/settings` | Autenticado |
| `PUT` | `/api/settings` | ADMIN |

### Modos de asignación

| Modo | Comportamiento |
|------|---------------|
| `MANUAL` | Admin asigna técnicos manualmente. Las solicitudes inician en `PENDIENTE`. |
| `SELF_ASSIGNMENT` | Las solicitudes inician en `DISPONIBLE`. Los técnicos toman y liberan trabajos. Incluye regla anti-cherry-picking con límite de trabajos activos simultáneos (`maxActiveJobs`). |
| `AUTO` | El sistema asigna automáticamente al mejor técnico disponible según especialidad y carga de trabajo. |

### Motor de auto-escalamiento

El servidor ejecuta cada **5 minutos** un proceso en background que:
1. Busca solicitudes en estado `DISPONIBLE` sin técnico por más de 30 minutos.
2. Escala su prioridad (`BAJA → MEDIA → ALTA`).
3. Notifica a todos los técnicos con la especialidad correspondiente.

---

## 🛡️ API — Super Admin

Todas requieren token JWT con rol `SUPER_ADMIN`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/superadmin/metrics` | Métricas globales de la plataforma |
| `GET` | `/api/superadmin/admins` | Listar administradores |
| `POST` | `/api/superadmin/admins` | Crear nuevo administrador |
| `PATCH` | `/api/superadmin/admins/:id/deactivate` | Activar/desactivar administrador |
| `GET` | `/api/superadmin/audit?page=1&limit=10` | Logs de auditoría paginados |

### Acciones auditadas

`LOGIN`, `REGISTER`, `CREATE_REQUEST`, `ASSIGN_REQUEST`, `STATUS_CHANGE`, `TAKE_REQUEST`, `RELEASE_REQUEST`.

---

## 📄 Paginación

Todos los listados usan `page` y `limit` (máximo `100`).

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## 🖥️ Frontend — Rutas

### Rutas públicas

| Ruta | Página |
|------|--------|
| `/` | Landing Page |
| `/login` | Login (email/password + Google OAuth) |
| `/register` | Registro (cliente o técnico con DNI) |
| `/server-error` | Error del servidor |
| `*` | 404 Not Found |

### Rutas privadas

| Ruta | Página | Permiso |
|------|--------|---------|
| `/dashboard` | Dashboard con métricas | Todos |
| `/requests` | Listado de solicitudes | Todos |
| `/requests/new` | Crear solicitud | CLIENTE |
| `/requests/:id` | Detalle de solicitud | Relacionados o ADMIN |
| `/requests/available` | Trabajos disponibles | TECNICO |
| `/categories` | Gestión de categorías | ADMIN |
| `/settings` | Configuración de empresa | ADMIN |
| `/profile` | Ver perfil | Todos |
| `/profile/edit` | Editar perfil + avatar | Todos |
| `/superadmin/metrics` | Métricas globales | SUPER_ADMIN |
| `/superadmin/admins` | Gestión de admins | SUPER_ADMIN |
| `/superadmin/audit` | Logs de auditoría | SUPER_ADMIN |
| `/unauthorized` | Acceso denegado | Autenticados |

### Componentes UI

La interfaz usa Tailwind CSS con componentes locales estilo shadcn/ui:

`Button` · `Input` · `Textarea` · `Card` · `Badge` · `Table` · `Dialog` · `Dropdown` · `Skeleton` · `Alert` · `Toasts (Sonner)` · `NotificationBell` · `GoogleAuthModal` · `NetworkBackground` · `StatusBadge` · `Pagination` · `EmptyState` · `LoadingState` · `PageHeader`

El frontend guarda el JWT en `localStorage` con la clave `tecnilink_token`. Al recargar, `AuthContext` consulta `GET /api/auth/me` para restaurar la sesión.

---

## 🔒 Seguridad y estabilidad

- **Helmet** para cabeceras de seguridad HTTP.
- **CORS** validando `FRONTEND_URL`.
- **Rate limit global** configurable por variables de entorno.
- **Rate limit específico** para login (por IP) y consultas de DNI.
- **Winston** para logs estructurados (`logs/combined.log`, `logs/error.log`).
- **Morgan** para logs HTTP cuando `ENABLE_REQUEST_LOGS=true`.
- **Middleware centralizado** para errores 400, 401, 403, 404, 409, 429, 500 y 503.
- **Sanitización** de campos sensibles (`password`, `token`, `authorization`, `secret`) en logs.
- **Validación con Zod** en todas las entradas de la API.
- **Graceful shutdown** con `SIGINT`/`SIGTERM`, desconexión de Prisma y limpieza de intervalos.

Los errores 500 responden con un mensaje genérico y `requestId`; el detalle queda en logs.

---

## ✅ Verificación

```bash
curl http://localhost:4000/api/health
```

```json
{
  "status": "ok",
  "message": "Tecnilink API running",
  "uptime": 120.5,
  "timestamp": "2026-07-01T00:00:00.000Z",
  "environment": "development",
  "database": { "status": "up" }
}
```

Si la base de datos no está disponible: `status: "degraded"`, `database.status: "down"`.

---

## 🧪 Pruebas de carga con k6

Los scripts están en `load-tests/` y usan los usuarios del seed.

### Instalación de k6

- **Windows**: `winget install k6.k6`
- **macOS**: `brew install k6`
- **Linux**: [grafana.com/docs/k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)

### Preparación del `.env`

```env
ENABLE_REQUEST_LOGS=false
RATE_LIMIT_MAX=50000
LOGIN_RATE_LIMIT_MAX=1000
```

### Ejecución

```bash
# Smoke test
k6 run -e BASE_URL=http://localhost:4000 load-tests/smoke-test.js

# 50 usuarios virtuales
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-50-users.js

# 100 usuarios virtuales
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-100-users.js

# 1200 usuarios (exploratoria)
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-1200-users.js

# 90000 usuarios (stress)
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-90000-users.js

# 50000 requests (volumen)
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-50000-requests.js

# Rate limit
k6 run -e BASE_URL=http://localhost:4000 load-tests/rate-limit-test.js
```

### Métricas clave

| Métrica | Descripción |
|---------|-------------|
| `checks` | Validaciones exitosas |
| `http_req_failed` | Porcentaje de requests fallidos |
| `http_req_duration` | Latencia (promedio, p90, p95) |
| `http_reqs` | Total de requests |
| `vus` / `vus_max` | Usuarios virtuales activos / máximos |

La guía completa está en `docs/PRUEBAS_CARGA.md`.

---

## 📚 Documentación adicional

| Documento | Ubicación |
|-----------|-----------|
| Guía de pruebas de carga | `docs/PRUEBAS_CARGA.md` |
| Guía de despliegue en Render | `docs/guia_despliegue_git_render.md` |
| Configuración de deploy en Render | `README_DEPLOY_RENDER.md` |

---

## 📝 Licencia

Proyecto académico — Uso educativo.
]]>
