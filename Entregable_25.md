# 1. Portada

* **Nombre del proyecto:** Tecnilink
* **Curso:** [Nombre del curso]
* **Integrantes:** [Nombres de los integrantes]
* **Docente:** [Nombre del docente]
* **Fecha:** [Fecha de entrega]
* **Entregable:** 25%

[CAPTURA OPCIONAL: logo o pantalla principal del sistema]

---

# 2. Introducción del proyecto

Tecnilink es una plataforma web académica diseñada para gestionar solicitudes de soporte técnico. El problema principal que resuelve es la falta de organización y seguimiento en la atención de incidencias técnicas en entornos empresariales o educativos. 

En la plataforma interactúan tres tipos de usuarios:
* **Clientes:** Crean solicitudes de soporte técnico y revisan su estado.
* **Técnicos:** Atienden los casos asignados y actualizan su estado.
* **Administradores:** Gestionan la información básica del sistema, usuarios, categorías y asignan solicitudes.

Hasta el entregable del 25%, las funcionalidades incluyen un entorno cloud preparado, registro y autenticación diferenciada, CRUD inicial estructurado para categorías y solicitudes, protección de rutas mediante roles, y variables de entorno para una configuración segura.

---

# 3. Alcance del entregable 25%

Esta documentación cubre únicamente los puntos evaluados en la entrega del 25%. No se incluyen avances correspondientes a semanas posteriores.

Puntos solicitados desarrollados:
* Entorno cloud preparado.
* Endpoints desarrollados.
* Registro y login diferenciados.
* Rate limits.
* Vista para página inexistente o en desarrollo.
* Control de respuestas HTTP.
* CRUD estructurado inicial.
* Variables de entorno.
* Cifrado de contraseñas.
* Pruebas unitarias y masivas mínimas.
* Base de datos conectada y funcional.
* Diagrama editable de base de datos.
* Pruebas de servidor con 50 a 100 usuarios.

---

# 4. Tecnologías utilizadas

| Área | Tecnología | Uso |
| ---- | ---------- | --- |
| **Frontend** | React con Vite | Framework principal para la interfaz de usuario. |
| | Tailwind CSS | Estilos y diseño responsivo. |
| | React Router | Gestión de rutas y navegación en el cliente. |
| | Axios | Cliente HTTP para peticiones al backend. |
| **Backend** | Node.js | Entorno de ejecución de JavaScript en el servidor. |
| | Express | Framework para la creación de la API REST. |
| | Prisma | ORM para interactuar con la base de datos PostgreSQL. |
| | JWT | JSON Web Tokens para autenticación y autorización. |
| | bcrypt | Librería para el cifrado y hashing de contraseñas. |
| | Zod | Validación de esquemas y datos de entrada. |
| | Helmet | Seguridad estableciendo cabeceras HTTP. |
| | CORS | Middleware para control de acceso HTTP. |
| | Morgan / Winston | Registro (logging) de peticiones y errores. |
| | express-rate-limit | Limitador de peticiones para prevenir abusos. |
| **Pruebas** | k6 | Herramienta de pruebas de carga y rendimiento. |
| | curl / Navegador / Terminal | Pruebas manuales de endpoints. |
| **Base de datos** | Neon PostgreSQL | Base de datos relacional serverless en la nube. |
| | Prisma Studio | Interfaz gráfica local para gestionar los datos. |

[CAPTURA 1: estructura general del proyecto en el IDE]

---

# 5. Estructura del proyecto

El proyecto sigue una arquitectura de monorepo separando claramente el frontend y el backend:

```text
Tecnilink/
├── client/          # Contiene la aplicación Frontend (React)
├── server/          # Contiene la API Backend (Node/Express)
│   ├── config/      # Configuraciones (env, logs, db)
│   ├── controllers/ # Lógica de controladores HTTP
│   ├── middlewares/ # Middlewares de autenticación, validación, etc.
│   ├── routes/      # Definición de rutas de la API
│   ├── services/    # Lógica de negocio
│   ├── utils/       # Funciones utilitarias
│   └── prisma/      # Schema, migraciones y seed de Prisma
├── k6-load-test.js  # Pruebas de carga con k6
├── README.md        # Documentación principal
└── .gitignore       # Archivos ignorados por Git
```

* `client` contiene el frontend con sus componentes y vistas.
* `server` contiene el backend y la lógica de la API REST.
* `prisma` contiene el schema de la base de datos y la semilla inicial (seed).
* `src` (dentro de server/client) contiene el código fuente principal.

[CAPTURA 2: estructura del proyecto en el IDE]  
[CAPTURA 3: estructura de carpetas del backend]  
[CAPTURA 4: estructura de carpetas del frontend]

---

# 6. Entorno cloud preparado

* El proyecto utiliza **Neon PostgreSQL** como base de datos en la nube de alta disponibilidad.
* El backend se conecta a Neon mediante la URL proporcionada en las variables de entorno, usando el ORM Prisma.
* La arquitectura está preparada para un futuro despliegue en contenedores o servicios como Google Cloud Run, aunque para esta entrega la ejecución local conectada a la BD Cloud cumple el requisito.
* El endpoint público `/api/health` confirma que tanto el backend como la conexión a la base de datos están operativos.

[CAPTURA 5: panel de Neon mostrando el proyecto/base de datos activa]  
[CAPTURA 6: archivo .env.example con variables sin secretos reales]  
[CAPTURA 7: navegador mostrando http://localhost:4000/api/health con database.status up]  
[CAPTURA 8: terminal con backend ejecutándose]

---

# 7. Endpoints desarrollados

## 7.1 Autenticación
| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Registro de usuario cliente | Público |
| POST | `/api/auth/login` | Inicio de sesión | Público |
| GET | `/api/auth/me` | Obtener usuario autenticado | Usuario con token |

## 7.2 Categorías
| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| GET | `/api/categories` | Listar categorías | ADMIN, CLIENTE, TECNICO |
| POST | `/api/categories` | Crear categoría | ADMIN |
| PUT | `/api/categories/:id` | Actualizar categoría | ADMIN |
| DELETE | `/api/categories/:id` | Desactivar categoría | ADMIN |

## 7.3 Solicitudes técnicas
| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| GET | `/api/requests` | Listar solicitudes según rol | ADMIN, CLIENTE, TECNICO |
| POST | `/api/requests` | Crear solicitud | CLIENTE |
| GET | `/api/requests/:id` | Ver detalle | Usuario relacionado o ADMIN |
| PUT | `/api/requests/:id` | Actualizar solicitud | ADMIN o CLIENTE propietario |
| PATCH | `/api/requests/:id/assign`| Asignar técnico | ADMIN |
| PATCH | `/api/requests/:id/status`| Actualizar estado | TECNICO asignado |
| DELETE | `/api/requests/:id` | Cancelar solicitud | ADMIN o CLIENTE propietario |

## 7.4 Comentarios
| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| GET | `/api/requests/:id/comments` | Listar comentarios | Usuario relacionado o ADMIN |
| POST | `/api/requests/:id/comments`| Crear comentario | Usuario relacionado o ADMIN |

## 7.5 Health Check
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Verificar estado del backend y base de datos |

[CAPTURA 9: navegador mostrando /api/health]  
[CAPTURA 10: terminal usando curl para /api/health]  
[CAPTURA 11: terminal usando curl para login]  
[CAPTURA 12: terminal usando curl para endpoint protegido con Authorization Bearer token]

---

# 8. Registro y login diferenciados

* **Registro:** Permite la creación exclusiva de usuarios con el rol `CLIENTE`. Por seguridad, no se permite registrar cuentas de administrador o técnico desde este endpoint público.
* **Login:** Valida credenciales y devuelve un token JWT.
* **Token:** El frontend almacena el token de manera segura (ej. localStorage) y lo envía en la cabecera `Authorization` en peticiones a rutas protegidas.

**Usuarios de prueba (Seed):**
* **ADMIN:** admin@tecnilink.com / password123
* **TECNICO:** tecnico@tecnilink.com / password123
* **CLIENTE:** cliente@tecnilink.com / password123

[CAPTURA 13: pantalla de registro]  
[CAPTURA 14: pantalla de login]  
[CAPTURA 15: dashboard después de iniciar sesión]  
[CAPTURA 16: localStorage mostrando la clave del token, ocultando el valor completo]

---

# 9. Control de roles y rutas protegidas

El sistema gestiona la seguridad utilizando JWT y middlewares específicos:
* `authenticateToken`: Verifica que el token JWT sea válido y no haya expirado. Si falla o no existe, retorna **401 Unauthorized**.
* `authorizeRoles`: Verifica que el rol del usuario autenticado coincida con los permitidos para el endpoint. Si el usuario no tiene el rol necesario, retorna **403 Forbidden**.

Roles implementados: `ADMIN`, `TECNICO`, `CLIENTE`.

[CAPTURA 17: código donde se usa authenticateToken]  
[CAPTURA 18: código donde se usa authorizeRoles]  
[CAPTURA 19: pantalla UnauthorizedPage]  
[CAPTURA 20: vista de una página protegida]

---

# 10. Rate limits

Para prevenir ataques de fuerza bruta, denegación de servicio (DoS) y uso abusivo, se configuró `express-rate-limit` utilizando las siguientes variables:
* `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`: Para peticiones generales.
* `LOGIN_RATE_LIMIT_WINDOW_MS` / `LOGIN_RATE_LIMIT_MAX`: Para el endpoint de login (más estricto).

**Nota de Pruebas:**
Durante las pruebas automatizadas con k6, el limitador bloqueó exitosamente las peticiones concurrentes devolviendo el código 429. Para permitir la ejecución de las pruebas de estrés, los límites fueron elevados temporalmente:
* RATE_LIMIT_MAX=50000
* LOGIN_RATE_LIMIT_MAX=1000
* ENABLE_REQUEST_LOGS=false

[CAPTURA 21: archivo de configuración del rate limiter]  
[CAPTURA 22: variables de rate limit en .env.example]  
[CAPTURA 23: evidencia de 429 Too Many Requests si existe]  
[CAPTURA 24: configuración temporal usada para pruebas]

---

# 11. Vista para página inexistente o en desarrollo

El frontend de la aplicación en React maneja el enrutamiento para asegurar una buena experiencia de usuario en rutas inválidas:
* **NotFoundPage:** Vista mostrada cuando el usuario navega a una URL que no existe.
* **UnauthorizedPage:** Vista cuando el usuario intenta acceder a una sección sin los permisos necesarios.

[CAPTURA 25: pantalla NotFoundPage]  
[CAPTURA 26: pantalla UnauthorizedPage]  
[CAPTURA 27: pantalla ServerErrorPage si existe]

---

# 12. Control de respuestas HTTP

| Código | Significado | Ejemplo en Tecnilink | Evidencia |
| --- | --- | --- | --- |
| 200 OK | Respuesta correcta. | Listar categorías exitosamente. | [Ver Captura 28] |
| 201 Created | Recurso creado. | Creación de una solicitud técnica. | [Ver Captura 29] |
| 400 Bad Request | Datos inválidos. | Body incompleto al crear comentario. | |
| 401 Unauthorized | Token faltante/inválido. | Intentar crear solicitud sin login. | [Ver Captura 30] |
| 403 Forbidden | Rol sin permiso. | Cliente intenta desactivar categoría. | [Ver Captura 31] |
| 404 Not Found | Recurso no encontrado. | Consultar un ID de solicitud que no existe. | [Ver Captura 32] |
| 429 Too Many Requests | Límite superado. | Demasiados intentos de login fallidos. | [Ver Captura 33] |
| 500 Server Error | Error del servidor. | Fallo de conexión o error no controlado. | [Ver Captura 34] |

[CAPTURA 28: ejemplo 200 OK]  
[CAPTURA 29: ejemplo 201 Created]  
[CAPTURA 30: ejemplo 401 sin token]  
[CAPTURA 31: ejemplo 403 con rol no permitido]  
[CAPTURA 32: ejemplo 404 ruta no encontrada]  
[CAPTURA 33: ejemplo 429 rate limit si existe]  
[CAPTURA 34: manejo de error 500 si existe]

---

# 13. CRUD estructurado inicial

El backend sigue un patrón estricto de capas (rutas -> middlewares de validación -> controladores -> servicios) para las siguientes entidades:

## Categorías
* Listar, Crear, Actualizar y Desactivar. Se emplea borrado lógico (`isActive=false`) para evitar la pérdida de integridad referencial.

## Solicitudes Técnicas
* Crear solicitud (clientes).
* Listar solicitudes (filtradas automáticamente por rol y usuario).
* Ver detalle de la solicitud.
* Asignar técnico (solo administradores).
* Actualizar estado (en progreso, resuelto, etc., por el técnico asignado).
* Cancelar solicitud.

## Comentarios
* Listar comentarios de una solicitud específica.
* Crear comentarios en la línea de tiempo del caso.

[CAPTURA 35: listado de categorías]  
[CAPTURA 36: creación de categoría o solicitud]  
[CAPTURA 37: listado de solicitudes]  
[CAPTURA 38: detalle de solicitud]  
[CAPTURA 39: diálogo de confirmación para acción peligrosa]

---

# 14. Variables de entorno

Se utiliza un archivo `.env` en el backend para gestionar las configuraciones según el entorno (desarrollo, pruebas, producción), evitando la exposición de secretos en el control de versiones.

| Variable | Propósito |
| --- | --- |
| PORT | Puerto en el que corre el servidor Express. |
| NODE_ENV | Entorno de ejecución (development / production). |
| FRONTEND_URL | URL permitida en los CORS para el cliente. |
| DATABASE_URL | Cadena de conexión a Neon PostgreSQL. |
| JWT_SECRET | Semilla secreta para firmar los tokens. |
| JWT_EXPIRES_IN | Tiempo de expiración del token (ej. 2h). |
| BCRYPT_SALT_ROUNDS | Complejidad del algoritmo de hashing. |
| RATE_LIMIT_* | Configuraciones numéricas para protección anti-abuso. |

[CAPTURA 40: archivo .env.example]  
[CAPTURA 41: terminal iniciando backend con variables cargadas, sin mostrar secretos]

---

# 15. Cifrado de contraseñas

* Todas las contraseñas se almacenan cifradas utilizando la librería **bcrypt**.
* En la creación o actualización de usuario, la contraseña pasa por un proceso de hashing usando el nivel de salt definido en `BCRYPT_SALT_ROUNDS` (típicamente 10).
* En el endpoint de login, se utiliza `bcrypt.compare()` para verificar la validez sin necesidad de descifrar el hash almacenado.

[CAPTURA 42: código donde se usa bcrypt.hash]  
[CAPTURA 43: código donde se usa bcrypt.compare]  
[CAPTURA 44: Prisma Studio mostrando hash de contraseña, ocultando parte si es necesario]

---

# 16. Base de datos conectada y funcional

El backend interactúa exitosamente con una base de datos relacional hospedada en **Neon PostgreSQL** a través del ORM **Prisma**. 
Modelos principales sincronizados:
* `User`
* `ServiceCategory`
* `TechnicalRequest`
* `RequestComment`

**Observación de Pruebas:**
El flujo completo de pruebas con k6 interactuó intensamente con la base de datos, generando la creación automática de solicitudes de prueba. Al verificar Prisma Studio, la tabla `TechnicalRequest` registró un conteo de 1670 registros tras las rondas de pruebas.

[CAPTURA 45: /api/health mostrando database.status up]  
[CAPTURA 46: Prisma Studio mostrando tablas]  
[CAPTURA 47: Neon SQL Editor con SELECT COUNT(*) FROM "TechnicalRequest"]  
[CAPTURA 48: resultado mostrando 1670 registros]

---

# 17. Diagrama editable de base de datos

A continuación se muestra el código DBML que puede ser utilizado en [dbdiagram.io](https://dbdiagram.io) para visualizar el diagrama entidad-relación de las entidades implementadas en este entregable:

```dbml
Table User {
  id String [pk]
  name String
  email String [unique]
  password String
  role String // ENUM: ADMIN, TECNICO, CLIENTE
  createdAt DateTime
  updatedAt DateTime
}

Table ServiceCategory {
  id String [pk]
  name String
  description String
  isActive Boolean
  createdAt DateTime
  updatedAt DateTime
}

Table TechnicalRequest {
  id String [pk]
  title String
  description String
  status String // ENUM: PENDING, IN_PROGRESS, RESOLVED, CANCELLED
  clientId String [ref: > User.id]
  technicianId String [ref: > User.id, null]
  categoryId String [ref: > ServiceCategory.id]
  createdAt DateTime
  updatedAt DateTime
}

Table RequestComment {
  id String [pk]
  content String
  requestId String [ref: > TechnicalRequest.id]
  authorId String [ref: > User.id]
  createdAt DateTime
  updatedAt DateTime
}
```

[CAPTURA 49: diagrama entidad-relación editable renderizado en herramienta]

---

# 18. Pruebas unitarias y masivas mínimas

Las pruebas de estrés y rendimiento se ejecutaron utilizando **k6** para evaluar el comportamiento del servidor ante concurrencia.

| Usuarios virtuales | Requests totales | Fallos HTTP | Checks exitosos | p95 | Resultado |
| --: | --: | --: | --: | --: | --- |
| 20 | 674 | 0.00% | 99.85% | 299.95 ms | Estable |
| 50 | 3050 | 0.00% | 100.00% | 3.97 s | Estable con latencia media |
| 100 | 5260 | 0.00% | 100.00% | 8.21 s | Estable con latencia alta |

Las pruebas evaluaron flujos completos de obtención de health check, login, listado de datos y simulación de creación de solicitudes. 
**Conclusión:** El sistema es totalmente estable y manejó todas las peticiones con una tasa de error del 0.00% de caídas. El incremento en la latencia (p95) en la prueba de 100 usuarios es el comportamiento esperado debido al volumen de consultas a la base de datos cloud (Neon) y procesamiento de contraseñas (bcrypt).

[CAPTURA 50: resultado k6 20 usuarios]  
[CAPTURA 51: resultado k6 50 usuarios]  
[CAPTURA 52: resultado k6 100 usuarios]

---

# 19. Incidencias detectadas y soluciones

## Incidencia 1: bloqueo por rate limit
* **Problema:** Durante las primeras pruebas con k6, el servidor rechazó masivamente las peticiones mostrando estado 429.
* **Causa:** El limitador de peticiones estaba calibrado para tráfico humano normal, interpretando la prueba automatizada como un ataque.
* **Solución:** Se ajustaron temporalmente los valores en `.env` a `RATE_LIMIT_MAX=50000` y `LOGIN_RATE_LIMIT_MAX=1000`.
* **Resultado:** Las pruebas finalizaron exitosamente con 0.00% de errores.

## Incidencia 2: datos generados por pruebas
* **Problema:** Las pruebas de estrés crearon un gran volumen de información en la base de datos de Neon.
* **Resultado:** La tabla `TechnicalRequest` almacenó 1670 registros tras las sesiones.
* **Recomendación/Solución:** Se ha documentado la necesidad de utilizar un entorno de base de datos exclusivo para "testing" (separado del de desarrollo y producción) para facilitar el borrado y la limpieza post-pruebas.

[CAPTURA 53: resultado inicial con fallos si existe]  
[CAPTURA 54: variables ajustadas para pruebas]  
[CAPTURA 55: conteo de registros TechnicalRequest]

---

# 20. Checklist de cumplimiento del 25%

| Requisito del profesor | Evidencia en Tecnilink | Estado | Captura |
| --- | --- | --- | --- |
| Entorno cloud preparado | Neon PostgreSQL conectado. | Cumple | [Captura 5] |
| Desarrollo de endpoints | Autenticación, Categorías, Solicitudes. | Cumple | [Captura 10] |
| Registro y login diferenciados | Roles definidos, token JWT en login. | Cumple | [Captura 13, 14] |
| Rate limits | express-rate-limit configurado. | Cumple | [Captura 21] |
| Vista de página inexistente | NotFoundPage y UnauthorizedPage en React. | Cumple | [Captura 25] |
| Control de respuestas HTTP | Códigos 200, 201, 400, 401, 403, 404, 500 controlados. | Cumple | [Captura 28-34]|
| CRUD estructurado inicial | Entidades en capas de ruta a servicio. | Cumple | [Captura 35-39]|
| Variables de entorno | .env usado para puertos, DB, secretos JWT y límites. | Cumple | [Captura 40] |
| Cifrado de contraseñas | Implementado con bcrypt. | Cumple | [Captura 42-44]|
| Pruebas unitarias/masivas | k6, curl y terminal utilizados. | Cumple | [Captura 50] |
| Base de datos conectada | /api/health y Prisma Studio lo confirman. | Cumple | [Captura 45] |
| Diagrama editable | DBML incluido en la documentación. | Cumple | [Captura 49] |
| Pruebas servidor 50-100 usr | Resultados de 20, 50 y 100 usuarios documentados. | Cumple | [Captura 50-52]|

---

# 21. Conclusión del entregable 25%

Tecnilink cumple íntegramente con los requisitos de la entrega del 25%. El proyecto ya cuenta con su entorno cloud preparado a través de la conexión a la base de datos Neon. Los endpoints principales de autenticación y gestión de solicitudes están desarrollados con un CRUD inicial bien estructurado. Se cuenta con registro y login diferenciados protegidos mediante JWT y control de acceso basado en roles.

La seguridad y confiabilidad se garantizan mediante la configuración de variables de entorno, cifrado de contraseñas con bcrypt, control adecuado de respuestas HTTP, vistas de error en el cliente y protección anti-abuso con rate limits. Las pruebas masivas realizadas con k6 con cargas de 20, 50 y 100 usuarios virtuales demuestran la alta estabilidad del sistema (0% de peticiones fallidas). Asimismo, se detectaron incidencias naturales en pruebas de estrés (como bloqueos iniciales por rate limit y generación de registros masivos) las cuales fueron identificadas, explicadas y documentadas para su futura mitigación.
