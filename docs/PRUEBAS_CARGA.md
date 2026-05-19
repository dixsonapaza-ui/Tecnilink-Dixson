# Pruebas de carga Tecnilink

## Objetivo

Validar que Tecnilink responde correctamente bajo carga controlada, usando escenarios representativos del flujo principal: salud de API, login, categorias, creacion de solicitudes, listado paginado y consulta de detalle.

La prueba oficial del 25% debe enfocarse en 50 a 100 usuarios simulados. La prueba de 1200 usuarios es exploratoria y debe presentarse como evidencia adicional, no como requisito principal.

## Preparacion

Antes de ejecutar las pruebas:

1. Configura `server/.env` con `DATABASE_URL`, `JWT_SECRET` y rate limits adecuados.
2. Ejecuta migraciones y seed.
3. Inicia el backend.
4. Desactiva logs HTTP si quieres reducir ruido durante carga.

```env
ENABLE_REQUEST_LOGS=false
RATE_LIMIT_MAX=50000
LOGIN_RATE_LIMIT_MAX=1000
```

Comandos:

```bash
cd server
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

## Scripts

| Script | Objetivo | Usuarios |
| --- | --- | --- |
| `load-tests/smoke-test.js` | Verificacion rapida de API y flujo base | 5 |
| `load-tests/load-50-users.js` | Prueba oficial 25% con carga moderada | 50 |
| `load-tests/load-100-users.js` | Prueba oficial 25% con carga alta | 100 |
| `load-tests/load-1200-users.js` | Prueba exploratoria adicional con subida gradual | 1200 |
| `load-tests/rate-limit-test.js` | Demostrar respuestas 429 del rate limit | 10 |

## Endpoints probados

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/categories`
- `POST /api/requests`
- `GET /api/requests?page=1&limit=20`
- `GET /api/requests/:id`

Los scripts hacen login en `setup()` y reutilizan tokens durante la sesion simulada. Esto evita hacer login antes de cada request y representa mejor el uso real de la aplicacion.

## Ejecucion

Por defecto, los scripts usan:

```text
BASE_URL=http://localhost:4000
```

Puedes cambiarlo con una variable de entorno:

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/smoke-test.js
```

### Smoke test

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/smoke-test.js
```

### 50 usuarios

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-50-users.js
```

### 100 usuarios

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-100-users.js
```

### 1200 usuarios exploratorio

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/load-1200-users.js
```

### Rate limit

```bash
k6 run -e BASE_URL=http://localhost:4000 load-tests/rate-limit-test.js
```

## Metricas a capturar

Guarda estas metricas del resumen de k6:

- `checks`: porcentaje de validaciones correctas.
- `http_req_failed`: porcentaje de requests fallidos.
- `http_req_duration`: promedio, mediana, p90 y p95.
- `http_reqs`: total de requests.
- `vus` y `vus_max`: usuarios activos y maximos.
- `iterations`: iteraciones completadas.
- `data_received` y `data_sent`: trafico total.

## Tabla de resultados

| Fecha | Script | BASE_URL | Usuarios max | Checks | Failed reqs | p95 duration | Requests totales | Observaciones |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
|  | smoke-test.js |  | 5 |  |  |  |  |  |
|  | load-50-users.js |  | 50 |  |  |  |  |  |
|  | load-100-users.js |  | 100 |  |  |  |  |  |
|  | load-1200-users.js |  | 1200 |  |  |  |  |  |
|  | rate-limit-test.js |  | 10 |  |  |  |  |  |

## Como interpretar resultados

Para la entrega del 25%, enfocate en:

- 50 y 100 usuarios.
- `http_req_failed` menor a 5%.
- `checks` mayor a 95%.
- p95 razonable para el entorno usado.

Si hay fallos, explica:

1. Que endpoint fallo.
2. Si fue por rate limit, latencia, base de datos o error de validacion.
3. Si ocurrio en subida, meseta o bajada de usuarios.
4. Que ajuste se propone: indices, pool de conexiones, rate limit, cache, PM2/Nginx o capacidad de la VM.

## Prueba de 1200 usuarios

La prueba de 1200 usuarios sube gradualmente. No debe presentarse como prueba oficial del 25%, sino como prueba exploratoria para observar limites del sistema.

Para esta prueba exploratoria puedes elevar temporalmente:

```env
RATE_LIMIT_MAX=1000000
LOGIN_RATE_LIMIT_MAX=10000
```

Forma recomendada de presentarla:

- "La prueba oficial se realizo con 50 y 100 usuarios simulados."
- "Adicionalmente, se ejecuto una prueba exploratoria hasta 1200 usuarios con subida gradual."
- "El objetivo fue identificar el punto de degradacion y oportunidades de mejora."
- "Los resultados no reemplazan una prueba de capacidad formal en infraestructura productiva."
