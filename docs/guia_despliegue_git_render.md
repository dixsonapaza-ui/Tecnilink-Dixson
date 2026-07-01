# Guía de Despliegue y Control de Versiones con Git y Render

Esta guía describe el paso a paso del laboratorio de control de versiones y despliegue continuo utilizando Git, Yarn, Nodemon, Dotenv y Render, adaptado para la estructura del proyecto **Tecnilink (servidor)**.

---

## 1. Control de Versiones con Git

### Paso 3: Instalar Git
Asegúrese de tener Git instalado en su sistema. Para verificar la versión instalada:
* **Consola:**
  ```powershell
  git --version
  ```
* **Salida esperada:**
  ```text
  git version 2.45.2.windows.1
  ```

### Paso 4: Inicializar Git
Navegue a la raíz del servidor de Tecnilink (`d:\Tecnilink\server`) e inicialice el repositorio.
* **Consola:**
  ```powershell
  cd d:\Tecnilink\server
  git init
  ```
* **Salida esperada:**
  ```text
  Initialized empty Git repository in d:/Tecnilink/server/.git/
  ```

### Paso 5: Mostrar la carpeta oculta `.git`
Para confirmar que el repositorio se ha inicializado correctamente en el explorador de archivos o la consola:
* **Consola:**
  ```powershell
  Get-ChildItem -Force
  ```
* **Salida esperada:**
  ```text
      Directory: d:\Tecnilink\server

  Mode                 LastWriteTime         Length Name
  ----                 -------------         ------ ----
  d--h--          7/1/2026   1:05 AM                .git
  d-----          7/1/2026   1:05 AM                prisma
  d-----          7/1/2026   1:05 AM                src
  -a----          7/1/2026   1:05 AM            108 .env
  -a----          7/1/2026   1:05 AM             48 .gitignore
  -a----          7/1/2026   1:05 AM            830 package.json
  ```
> [!NOTE]
> La carpeta `.git` es un directorio oculto del sistema donde se almacena todo el historial de cambios y configuración local de Git.

### Paso 6: Crear rama (branch)
* **Consola:**
  ```powershell
  git branch -M master
  ```

### Paso 7: Mostrar rama actual
* **Consola:**
  ```powershell
  git branch --show-current
  ```
* **Salida esperada:**
  ```text
  master
  ```

### Paso 8: Mostrar estado de Git
* **Consola:**
  ```powershell
  git status
  ```
* **Salida esperada:**
  ```text
  On branch master

  No commits yet

  Untracked files:
    (use "git add <file>..." to include in what will be committed)
          .env
          .gitignore
          package.json
          prisma/
          src/

  nothing added to commit but untracked files present (use "git add" to track)
  ```

### Paso 9: Añadir archivo individual
Para el laboratorio agregaremos el archivo de entrada principal (en el caso de Tecnilink, `src/server.js` o `index.js` si existiese en la raíz):
* **Consola:**
  ```powershell
  git add src/server.js
  ```

### Paso 10: Mostrar estado tras añadir archivo
* **Consola:**
  ```powershell
  git status
  ```
* **Salida esperada:**
  ```text
  On branch master

  No commits yet

  Changes to be committed:
    (use "git rm --cached <file>..." to unstage)
          new file:   src/server.js

  Untracked files:
    (use "git add <file>..." to include in what will be committed)
          .env
          .gitignore
          package.json
          prisma/
          src/app.js
          ...
  ```

### Registro de usuario en Git
Antes de realizar el commit inicial, identifíquese en la configuración global de Git:
* **Consola:**
  ```powershell
  git config --global user.email "rcoello@tecsup.edu.pe"
  git config --global user.name "Ricardo Coello Palomino"
  ```

### Paso 11: Realizar el primer commit
* **Consola:**
  ```powershell
  git commit -m "Primer commit"
  ```
* **Salida esperada:**
  ```text
  [master (root-commit) c8b5758] Primer commit
   1 file changed, 25 insertions(+)
   create mode 100644 src/server.js
  ```

---

## 2. Gestión de Dependencias con Yarn

### Paso 12: Instalar Yarn de forma global
* **Consola:**
  ```powershell
  npm install --global yarn
  ```
* **Salida esperada:**
  ```text
  added 1 package in 1.4s
  ```

### Paso 13: Inicializar Yarn
* **Consola:**
  ```powershell
  yarn init
  ```
* **Salida esperada:**
  ```text
  yarn init v1.22.22
  question name (server): tecnilink-server
  question version (1.0.0): 
  question description: Servidor Backend de Tecnilink
  question entry point (src/server.js): 
  question repository url: 
  question author (Ricardo Coello Palomino <rcoello@tecsup.edu.pe>): 
  question license (MIT): 
  question private: false
  success Saved package.json
  Done in 12.54s.
  ```

### Paso 14: Revisar estado tras inicializar Yarn
* **Consola:**
  ```powershell
  git status
  ```
* **Salida esperada:**
  ```text
  On branch master
  Changes not staged for commit:
    (use "git add <file>..." to update what will be committed)
    (use "git restore <file>..." to discard changes in working directory)
          modified:   package.json

  Untracked files:
    (use "git add <file>..." to include in what will be committed)
          .env
          .gitignore
          prisma/
          src/app.js
          ...
  ```

---

## 3. Integración de Nodemon y Dotenv

### Paso 15: Instalar Nodemon como dependencia de desarrollo
* **Consola:**
  ```powershell
  yarn add nodemon -D
  ```
* **Salida esperada:**
  ```text
  info Direct dependencies
  └─ nodemon@3.1.10
  info All dependencies
  └─ nodemon@3.1.10
  success Saved lockfile.
  success Saved 1 new dependency.
  Done in 3.42s.
  ```

### Paso 16: Instalar Dotenv como dependencia de desarrollo
* **Consola:**
  ```powershell
  yarn add dotenv -D
  ```
* **Salida esperada:**
  ```text
  yarn add v1.22.22
  [1/4] Resolving packages...
  [2/4] Fetching packages...
  [3/4] Linking dependencies...
  [4/4] Building fresh packages...
  success Saved lockfile.
  success Saved 1 new dependency.
  Done in 2.15s.
  ```

### Paso 17: Agregar Script de Desarrollo en `package.json`
Abra `package.json` y agregue el script `dev` para ejecutar la aplicación con nodemon:
```json
{
  "name": "tecnilink-server",
  "version": "1.0.0",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js"
  },
  "devDependencies": {
    "dotenv": "^16.4.5",
    "nodemon": "^3.1.10"
  }
}
```

### Paso 18: Ejecutar la aplicación en modo desarrollo
* **Consola:**
  ```powershell
  yarn dev
  ```
* **Salida esperada:**
  ```text
  yarn run v1.22.22
  $ nodemon src/server.js
  [nodemon] 3.1.10
  [nodemon] to restart at any time, enter `rs`
  [nodemon] watching path(s): *.*
  [nodemon] watching extensions: js,mjs,cjs,json
  [nodemon] starting `node src/server.js`
  Servidor backend corriendo en puerto 4000
  ```

### Paso 19: Agregar el archivo `.env`
Defina las variables de entorno necesarias para la aplicación:
```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tecnilink"
JWT_SECRET="supersecret_jwt_key_here"
```

### Paso 20: Verificar recarga automática (Nodemon)
Modifique cualquier línea de código en `src/server.js` y guarde el archivo.
* **Salida esperada en consola (reinicio automático):**
  ```text
  [nodemon] restarting due to changes...
  [nodemon] starting `node src/server.js`
  Servidor backend corriendo en puerto 4000
  ```

### Paso 21: Agregar el archivo `.gitignore`
Evite subir `node_modules` y `.env` al repositorio agregando las exclusiones en el archivo `.gitignore`:
```text
node_modules/
.env
dist/
```

---

## 4. Repositorio Remoto y Push a GitHub

### Paso 23: Agregar repositorio remoto
* **Consola:**
  ```powershell
  git remote add github https://github.com/Salvador-Coello-Palomino/repositorybackend.git
  ```

### Paso 24: Verificar repositorios remotos configurados
* **Consola:**
  ```powershell
  git remote -v
  ```
* **Salida esperada:**
  ```text
  github  https://github.com/Salvador-Coello-Palomino/repositorybackend.git (fetch)
  github  https://github.com/Salvador-Coello-Palomino/repositorybackend.git (push)
  ```

### Paso 25: Añadir y confirmar cambios para subir
* **Consola:**
  ```powershell
  git add package.json
  git commit -m "Agregamos package.json"
  ```
* **Salida esperada:**
  ```text
  [master bb3a12f] Agregamos package.json
   1 file changed, 15 insertions(+)
   create mode 100644 package.json
  ```

### Paso 26: Revisar estado antes de subir todo
* **Consola:**
  ```powershell
  git status
  ```

### Paso 27: Agregar todos los archivos restantes
* **Consola:**
  ```powershell
  git add .
  ```

### Paso 28: Mostrar estado tras añadir todo
* **Consola:**
  ```powershell
  git status
  ```
* **Salida esperada:**
  ```text
  On branch master
  Changes to be committed:
    (use "git restore --staged <file>..." to unstage)
          new file:   .gitignore
          new file:   yarn.lock
          modified:   src/server.js
  ```

### Paso 29: Commit previo a GitHub
* **Consola:**
  ```powershell
  git commit -m "Listo para ir a GitHub"
  ```

### Paso 30: Cambiar rama a `main` y realizar Push
* **Consola:**
  ```powershell
  git branch -m main
  git push -u github main
  ```
* **Salida esperada:**
  ```text
  Enumerating objects: 7, done.
  Counting objects: 100% (7/7), done.
  Delta compression using up to 16 threads
  Compressing objects: 100% (5/5), done.
  Writing objects: 100% (7/7), 2.34 KiB | 2.34 MiB/s, done.
  Total 7 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
  To https://github.com/Salvador-Coello-Palomino/repositorybackend.git
   * [new branch]      main -> main
  branch 'main' set up to track remote branch 'main' from 'github'.
  ```

---

## 5. Despliegue en la Nube con Render

### Ubicaciones exactas para Capturas de Pantalla del Laboratorio:
Al realizar este laboratorio con el proyecto **Tecnilink**, guarde las capturas en las siguientes ubicaciones para la entrega del informe:

1. **Captura 1 (Paso 5 - Mostrar carpeta .git oculta):**
   * **Nombre:** `paso05_carpeta_git.png`
   * **Ubicación:** `d:\Tecnilink\docs\screenshots\paso05_carpeta_git.png`
2. **Captura 2 (Paso 18 - Consola de Nodemon y Servidor corriendo):**
   * **Nombre:** `paso18_nodemon_dev.png`
   * **Ubicación:** `d:\Tecnilink\docs\screenshots\paso18_nodemon_dev.png`
3. **Captura 3 (Paso 31 - Repositorio subido en GitHub):**
   * **Nombre:** `paso31_repositorio_github.png`
   * **Ubicación:** `d:\Tecnilink\docs\screenshots\paso31_repositorio_github.png`
4. **Captura 4 (Paso 35 - Configuración y "Deploy Web Service" en Render):**
   * **Nombre:** `paso35_render_deploy.png`
   * **Ubicación:** `d:\Tecnilink\docs\screenshots\paso35_render_deploy.png`
5. **Captura 5 (Paso 36 - Render Dashboard mostrando Logs de inicio exitoso):**
   * **Nombre:** `paso36_render_logs.png`
   * **Ubicación:** `d:\Tecnilink\docs\screenshots\paso36_render_logs.png`

### Logs esperados en Render (Paso 37):
Cuando el Web Service se compila e inicia en los servidores de Render, la sección de Logs debe mostrar:
```text
==> Version cmr1kqryy0002v2yof2w8wjtl
==> Running build command 'yarn install'...
yarn install v1.22.22
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
success Saved lockfile.
Done in 5.12s.
==> Uploading build...
==> Build successful 🎉
==> Deploying...
==> Starting service with 'node src/server.js'...
Servidor backend corriendo en puerto 10000
Prisma schema loaded and database connected successfully.
```
