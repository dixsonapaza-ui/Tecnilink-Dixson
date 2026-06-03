# Despliegue de Tecnilink en Render

Esta guía te explica paso a paso cómo desplegar tu proyecto (Frontend y Backend) de manera gratuita o a bajo costo utilizando [Render](https://render.com/), conectándolo directamente con tu repositorio de GitHub y usando tu base de datos actual en Neon.

---

## 1. Preparativos

1. Sube todos tus cambios actuales a tu repositorio de GitHub en la rama `main`.
2. Crea una cuenta en [Render](https://render.com/) e inicia sesión vinculando tu cuenta de GitHub.
3. Ten a la mano tu `DATABASE_URL` (la de Neon) y tu `JWT_SECRET`.

---

## 2. Despliegue del Backend (Web Service)

Primero desplegaremos el Backend para obtener la URL pública de la API, la cual necesitaremos luego para el Frontend.

1. En el Dashboard de Render, haz clic en **New +** y selecciona **Web Service**.
2. Selecciona **Build and deploy from a Git repository** y elige tu repositorio de GitHub (`Tecnilink-Dixson`).
3. Llena el formulario con los siguientes datos:
   - **Name**: `tecnilink-api` (o el nombre que prefieras).
   - **Language**: `Node`.
   - **Branch**: `main`.
   - **Root Directory**: `server` (¡Muy importante!).
   - **Build Command**: `npm install && npm run build` (Esto instalará dependencias y ejecutará Prisma Generate).
   - **Start Command**: `npm start`
4. Baja a la sección **Environment Variables** (Variables de Entorno) y agrega las siguientes:
   - `DATABASE_URL`: `[TU_URL_DE_NEON]`
   - `JWT_SECRET`: `[TU_SECRETO_JWT]`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `*` *(Por ahora pon un asterisco, la cambiaremos cuando tengamos la URL del frontend para que el CORS sea más estricto).*
5. Haz clic en **Create Web Service**.
6. Render empezará a construir y desplegar tu backend. Una vez terminado, te dará una URL pública parecida a `https://tecnilink-api.onrender.com`. **Copia esta URL, la necesitaremos para el Frontend**.

---

## 3. Despliegue del Frontend (Static Site)

1. Vuelve al Dashboard de Render, haz clic en **New +** y selecciona **Static Site**.
2. Vuelve a seleccionar tu repositorio de GitHub.
3. Llena el formulario con los siguientes datos:
   - **Name**: `tecnilink-client`.
   - **Branch**: `main`.
   - **Root Directory**: `client` (¡Muy importante!).
   - **Build Command**: `npm install && npm run build`
   - **Publish directory**: `dist`
4. Baja a la sección **Environment Variables** y agrega:
   - `VITE_API_URL`: `https://tecnilink-api.onrender.com/api` *(Asegúrate de reemplazar con la URL de tu backend y agregarle `/api` al final)*.
5. Haz clic en **Create Static Site**.
6. Una vez desplegado, Render te dará otra URL como `https://tecnilink-client.onrender.com`. Esta es la URL de tu aplicación.

---

## 4. Ajustes Finales (CORS de Producción)

Para mayor seguridad, limitaremos quién puede hacerle peticiones a tu API.

1. Ve a tu servicio **Backend (tecnilink-api)** en Render.
2. Entra a la pestaña **Environment**.
3. Edita la variable `FRONTEND_URL` y reemplaza el asterisco (`*`) por la URL de tu frontend: `https://tecnilink-client.onrender.com`.
4. Guarda los cambios. Render reiniciará automáticamente tu backend.

---

## 5. Verificación

1. Abre la URL de tu Frontend.
2. Crea una cuenta nueva o haz login con una existente.
3. Al navegar por el sistema, el frontend se comunicará exitosamente con el backend en Render, y los datos se guardarán correctamente en tu base de datos Neon.
