# API RESTful de Tareas

API REST desarrollada con Node.js y Express para administrar tareas mediante operaciones CRUD. Incluye registro de usuarios, autenticación mediante JWT y almacenamiento de información en archivos JSON.

## Tecnologías utilizadas

- Node.js
- Express
- JavaScript
- JSON
- bcryptjs
- JSON Web Token (JWT)
- File System (`fs.promises`)

## Funcionalidades

- Registro de usuarios.
- Cifrado de contraseñas mediante bcryptjs.
- Inicio de sesión con autenticación JWT.
- Protección de rutas mediante middleware.
- Crear tareas.
- Consultar tareas.
- Actualizar tareas.
- Eliminar tareas.
- Manejo personalizado de errores.
- Almacenamiento de datos en archivos JSON.

## Instalación

1. Clonar el repositorio:

   `git clone URL_DEL_REPOSITORIO`

2. Entrar a la carpeta:

   `cd api-tareas`

3. Instalar las dependencias:

   `npm install`

4. Crear los archivos `tareas.json` y `usuarios.json` en la carpeta principal. Ambos deben contener inicialmente:

   `[]`

5. Iniciar el servidor:

   `node server.js`

El servidor estará disponible en:

`http://localhost:3000`

## Endpoints disponibles

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| POST | /register | Registrar usuario | No |
| POST | /login | Iniciar sesión | No |
| GET | /tareas | Consultar tareas | Sí |
| POST | /tareas | Crear tarea | Sí |
| PUT | /tareas/:id | Actualizar tarea | Sí |
| DELETE | /tareas/:id | Eliminar tarea | Sí |

## Autenticación

Para acceder a las rutas de tareas es necesario iniciar sesión mediante `/login`.

El servidor devuelve un token JWT que debe enviarse en las solicitudes protegidas mediante el encabezado:

`Authorization: Bearer TU_TOKEN`

Las contraseñas se almacenan cifradas mediante bcryptjs.

## Almacenamiento

La información se almacena localmente en dos archivos:

- `tareas.json`: contiene las tareas registradas.
- `usuarios.json`: contiene los usuarios y sus contraseñas cifradas.

Estos archivos no se incluyen en el repositorio para evitar publicar información de prueba.

## Autor

Proyecto académico desarrollado como práctica de Desarrollo Full Stack.
