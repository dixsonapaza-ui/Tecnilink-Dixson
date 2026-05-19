# Tecnilink

Tecnilink es una plataforma web academica para gestionar solicitudes de soporte tecnico. El sistema permitira que clientes creen solicitudes, tecnicos atiendan casos asignados y administradores gestionen usuarios, categorias, solicitudes y metricas basicas.

El proyecto se desarrolla por fases. Actualmente incluye un monorepo con frontend y backend separados, una API Express basica, configuracion inicial de Prisma, modelo PostgreSQL preparado para Neon y autenticacion con JWT.

## Tecnologias iniciales

### Frontend

- React con Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL con Neon
- dotenv
- cors
- helmet
- morgan
- bcrypt
- JWT
- Zod
- express-rate-limit

## Estructura

```text
Tecnilink/
  client/
  server/
    prisma/
    src/
      config/
      controllers/
      middlewares/
      routes/
      services/
      utils/
  README.md
  .gitignore
```

## Variables de entorno

En `server`, crea un archivo `.env` tomando como base `.env.example`:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
JWT_SECRET="cambia-este-valor-por-una-clave-larga-y-segura"
JWT_EXPIRES_IN=2h
BCRYPT_SALT_ROUNDS=10
LOGIN_RATE_LIMIT_WINDOW_MS=600000
LOGIN_RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
ENABLE_REQUEST_LOGS=true
```

Para obtener `DATABASE_URL` en Neon:

1. Crea un proyecto en Neon.
2. Entra a `Connection Details`.
3. Selecciona `Prisma` o `Node.js` como formato de conexion.
4. Copia la URL PostgreSQL.
5. Asegurate de conservar `?sslmode=require` al final de la URL.

`FRONTEND_URL` acepta una o varias URLs separadas por coma. Ejemplo para desarrollo:

```env
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

`JWT_SECRET` debe ser una clave larga y segura. El backend valida las variables de entorno al arrancar y se detiene si falta una variable critica.

El frontend usa por defecto `http://localhost:4000/api`. Si necesitas cambiarlo, crea `client/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

## Instalacion

Instala dependencias del backend:

```bash
cd server
npm install
```

Instala dependencias del frontend:

```bash
cd client
npm install
```

## Base de datos

Genera el cliente Prisma:

```bash
cd server
npm run prisma:generate
```

Crea y aplica la migracion inicial en Neon:

```bash
cd server
npm run prisma:migrate -- --name init
```

Ejecuta el seed inicial:

```bash
cd server
npm run prisma:seed
```

Abre Prisma Studio:

```bash
cd server
npm run prisma:studio
```

El seed crea:

- 1 administrador
- 2 tecnicos
- 3 clientes
- 4 categorias
- 10 solicitudes tecnicas
- comentarios de ejemplo

Todos los usuarios del seed usan la contrasena temporal:

```text
Tecnilink123!
```

## Autenticacion

El registro publico siempre crea usuarios con rol `CLIENTE`. No se acepta un rol enviado desde el cliente para evitar registros publicos como `ADMIN` o `TECNICO`.

### Registrar usuario

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Cliente Demo\",\"email\":\"cliente.demo@tecnilink.test\",\"password\":\"Tecnilink123!\"}"
```

Respuesta exitosa: `201 Created`.

### Iniciar sesion

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"cliente.demo@tecnilink.test\",\"password\":\"Tecnilink123!\"}"
```

Respuesta exitosa: `200 OK`, con un `token` JWT y los datos publicos del usuario.

El login tiene un limite por IP configurado con:

```env
LOGIN_RATE_LIMIT_WINDOW_MS=600000
LOGIN_RATE_LIMIT_MAX=5
```

### Consultar usuario autenticado

Reemplaza `TOKEN_AQUI` por el token recibido en login:

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer TOKEN_AQUI"
```

Respuesta exitosa: `200 OK`, con los datos del usuario autenticado.

### Control de roles

Las rutas protegidas usan `authenticateToken` para validar el JWT. Cuando una ruta debe limitarse por rol, se agrega `authorizeRoles`.

Ejemplo para una ruta futura solo de administradores:

```js
router.get('/admin-only', authenticateToken, authorizeRoles('ADMIN'), controller);
```

Si el token falta o no es valido, la API responde `401`. Si el usuario autenticado no tiene el rol requerido, responde `403`.

## Categorias

Todas las rutas de categorias requieren token JWT.

| Metodo | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/categories?page=1&limit=10` | ADMIN, CLIENTE, TECNICO |
| POST | `/api/categories` | ADMIN |
| PUT | `/api/categories/:id` | ADMIN |
| DELETE | `/api/categories/:id` | ADMIN |

`DELETE /api/categories/:id` hace borrado logico con `isActive=false`.

Crear categoria:

```bash
curl -X POST http://localhost:4000/api/categories \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Soporte remoto\",\"description\":\"Atencion tecnica por canales remotos.\"}"
```

Listar categorias activas:

```bash
curl "http://localhost:4000/api/categories?page=1&limit=10" \
  -H "Authorization: Bearer TOKEN"
```

## Solicitudes tecnicas

Todas las rutas de solicitudes requieren token JWT.

| Metodo | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/requests?page=1&limit=10` | ADMIN ve todas, CLIENTE ve propias, TECNICO ve asignadas |
| POST | `/api/requests` | CLIENTE |
| GET | `/api/requests/:id` | Usuario relacionado o ADMIN |
| PUT | `/api/requests/:id` | ADMIN o CLIENTE propietario si esta PENDIENTE |
| PATCH | `/api/requests/:id/assign` | ADMIN |
| PATCH | `/api/requests/:id/status` | TECNICO asignado |
| DELETE | `/api/requests/:id` | ADMIN o CLIENTE propietario si esta PENDIENTE |

Filtros disponibles en listados:

```text
status=PENDIENTE|EN_PROCESO|ATENDIDA|CANCELADA
priority=BAJA|MEDIA|ALTA
categoryId=ID_DE_CATEGORIA
```

Ejemplo:

```bash
curl "http://localhost:4000/api/requests?page=1&limit=10&status=PENDIENTE&priority=ALTA" \
  -H "Authorization: Bearer TOKEN"
```

Crear solicitud como CLIENTE:

```bash
curl -X POST http://localhost:4000/api/requests \
  -H "Authorization: Bearer TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Laptop no enciende\",\"description\":\"El equipo no responde al boton de encendido.\",\"priority\":\"ALTA\",\"categoryId\":\"ID_CATEGORIA\"}"
```

Asignar tecnico como ADMIN:

```bash
curl -X PATCH http://localhost:4000/api/requests/ID_SOLICITUD/assign \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d "{\"technicianId\":\"ID_TECNICO\"}"
```

Actualizar estado como TECNICO asignado:

```bash
curl -X PATCH http://localhost:4000/api/requests/ID_SOLICITUD/status \
  -H "Authorization: Bearer TOKEN_TECNICO" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"ATENDIDA\"}"
```

Cancelar solicitud pendiente:

```bash
curl -X DELETE http://localhost:4000/api/requests/ID_SOLICITUD \
  -H "Authorization: Bearer TOKEN_CLIENTE"
```

## Comentarios

Solo usuarios relacionados con la solicitud pueden comentar o listar comentarios. ADMIN puede hacerlo en cualquier solicitud.

| Metodo | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/requests/:id/comments?page=1&limit=10` | ADMIN, cliente propietario o tecnico asignado |
| POST | `/api/requests/:id/comments` | ADMIN, cliente propietario o tecnico asignado |

Crear comentario:

```bash
curl -X POST http://localhost:4000/api/requests/ID_SOLICITUD/comments \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"Se reviso el caso y queda pendiente validacion.\"}"
```

## Paginacion

Todos los listados usan `page` y `limit`. `limit` tiene un maximo de `100`.

Respuesta de ejemplo:

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

## Ejecucion

Inicia el backend:

```bash
cd server
npm run dev
```

Inicia el frontend en otra terminal:

```bash
cd client
npm run dev
```

El backend queda disponible en `http://localhost:4000`.

El frontend queda disponible en `http://localhost:5173`.

## Verificacion

Prueba el endpoint de salud del backend:

```bash
curl http://localhost:4000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "message": "Tecnilink API running",
  "uptime": 120.5,
  "timestamp": "2026-05-18T00:00:00.000Z",
  "environment": "development",
  "database": {
    "status": "up"
  }
}
```

Si la API responde pero la base de datos no esta disponible, `status` sera `degraded` y `database.status` sera `down`.

Para verificar la base de datos:

1. Ejecuta migraciones con `npm run prisma:migrate -- --name init`.
2. Ejecuta el seed con `npm run prisma:seed`.
3. Abre Prisma Studio con `npm run prisma:studio`.
4. Confirma que existan registros en `User`, `ServiceCategory`, `TechnicalRequest` y `RequestComment`.

Para verificar el frontend, abre `http://localhost:5173` y confirma que se muestra el estado devuelto por `GET /api/health`.

## Seguridad y estabilidad

El backend usa:

- Helmet para cabeceras de seguridad.
- CORS validando `FRONTEND_URL`.
- Rate limit global configurable.
- Rate limit especifico para login.
- Winston para logs estructurados.
- Morgan para logs HTTP cuando `ENABLE_REQUEST_LOGS=true`.
- Middleware centralizado para errores 400, 401, 403, 404, 409, 429 y 500.

Los errores 500 responden con un mensaje generico y `requestId`; el detalle real queda en logs. Los logs sanitizan campos sensibles como `password`, `token`, `authorization` y `secret`.

Archivos de log:

```text
server/logs/combined.log
server/logs/error.log
```

Para reducir ruido durante pruebas de carga:

```env
ENABLE_REQUEST_LOGS=false
```

Para modificar limites durante pruebas:

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
LOGIN_RATE_LIMIT_WINDOW_MS=600000
LOGIN_RATE_LIMIT_MAX=5
```

Para una prueba exploratoria puedes subir `RATE_LIMIT_MAX`. Para validar bloqueo, bajalo temporalmente y reinicia el backend.

Verificar CORS con un origen permitido:

```bash
curl -I http://localhost:4000/api/health -H "Origin: http://localhost:5173"
```

Debe incluir:

```text
Access-Control-Allow-Origin: http://localhost:5173
```

## Pruebas de carga con k6

Los scripts estan en `load-tests/` y usan los usuarios creados por el seed. Antes de ejecutarlos, aplica migraciones, ejecuta el seed e inicia el backend.

Instalar k6:

- Windows: `winget install k6.k6`
- macOS: `brew install k6`
- Linux: revisa `https://grafana.com/docs/k6/latest/set-up/install-k6/`

Preparacion recomendada:

```env
ENABLE_REQUEST_LOGS=false
RATE_LIMIT_MAX=50000
LOGIN_RATE_LIMIT_MAX=1000
```

Ejecutar smoke test:

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/smoke-test.js
```

Ejecutar prueba oficial con 50 usuarios:

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-50-users.js
```

Ejecutar prueba oficial con 100 usuarios:

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-100-users.js
```

Ejecutar prueba exploratoria con 1200 usuarios:

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-1200-users.js
```

Ejecutar prueba de rate limit:

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/rate-limit-test.js
```

Metricas importantes:

- `checks`: validaciones exitosas.
- `http_req_failed`: porcentaje de requests fallidos.
- `http_req_duration`: latencia promedio, p90 y p95.
- `http_reqs`: total de requests.
- `vus` y `vus_max`: usuarios virtuales activos y maximos.

La prueba de 1200 usuarios es exploratoria. Para la entrega del 25%, presenta principalmente los resultados de 50 y 100 usuarios. La guia completa esta en `docs/PRUEBAS_CARGA.md`.

## Frontend funcional

Rutas publicas:

| Ruta | Pagina |
| --- | --- |
| `/` | LandingPage |
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/server-error` | ServerErrorPage |
| `*` | NotFoundPage |

Rutas privadas:

| Ruta | Pagina | Permiso |
| --- | --- | --- |
| `/dashboard` | DashboardPage | ADMIN, CLIENTE, TECNICO |
| `/requests` | RequestsPage | ADMIN, CLIENTE, TECNICO |
| `/requests/new` | CreateRequestPage | CLIENTE |
| `/requests/:id` | RequestDetailPage | ADMIN, CLIENTE relacionado, TECNICO asignado |
| `/categories` | CategoriesPage | ADMIN |
| `/unauthorized` | UnauthorizedPage | Usuarios autenticados |

El frontend guarda el JWT en `localStorage` con la clave `tecnilink_token`. Al recargar la pagina, `AuthContext` consulta `GET /api/auth/me` para mantener la sesion.

Para probar desde la interfaz:

1. Ejecuta backend y frontend.
2. Abre `http://localhost:5173`.
3. Entra a `Registrarse` para crear un cliente.
4. Inicia sesion en `/login`.
5. Como CLIENTE, entra a `Nueva solicitud`, selecciona una categoria activa y crea el caso.
6. Como ADMIN, entra a `Categorias` para crear, editar o desactivar categorias.
7. Como TECNICO, entra a `Solicitudes` para ver asignaciones y actualizar estado desde el detalle.

Comandos:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

## Interfaz moderna

La interfaz usa Tailwind CSS con componentes locales tipo shadcn/ui:

- Button
- Input
- Card
- Badge
- Table
- Dialog
- Dropdown
- Skeleton
- Alert
- Toasts con Sonner

Las acciones peligrosas como cancelar solicitudes o desactivar categorias muestran un dialogo de confirmacion. Los errores se muestran con alerts y toasts, los estados de carga usan skeletons y los listados sin datos usan estados vacios claros.
