const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configuración
const archivoTareas = path.join(__dirname, 'tareas.json');
const archivoUsuarios = path.join(__dirname, 'usuarios.json');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_temporal_cambiar_123';

// Funciones para leer y guardar información
async function leerTareas() {
    const datos = await fs.readFile(archivoTareas, 'utf8');
    return JSON.parse(datos);
}

async function guardarTareas(tareas) {
    await fs.writeFile(
        archivoTareas,
        JSON.stringify(tareas, null, 2)
    );
}

async function leerUsuarios() {
    const datos = await fs.readFile(archivoUsuarios, 'utf8');
    return JSON.parse(datos);
}

async function guardarUsuarios(usuarios) {
    await fs.writeFile(
        archivoUsuarios,
        JSON.stringify(usuarios, null, 2)
    );
}

// Función para manejar errores asíncronos
const asyncHandler = (funcion) => {
    return (req, res, next) => {
        Promise.resolve(funcion(req, res, next)).catch(next);
    };
};

// Middleware de autenticación
function verificarToken(req, res, next) {
    const encabezado = req.headers.authorization;

    if (!encabezado || !encabezado.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'No se proporcionó un token'
        });
    }

    const token = encabezado.split(' ')[1];

    try {
        const datos = jwt.verify(token, JWT_SECRET);
        req.usuario = datos;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido o expirado'
        });
    }
}

// REGISTRO DE USUARIOS
app.post('/register', asyncHandler(async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        const error = new Error('Debes proporcionar usuario y contraseña');
        error.status = 400;
        throw error;
    }

    if (password.length < 6) {
        const error = new Error('La contraseña debe tener al menos 6 caracteres');
        error.status = 400;
        throw error;
    }

    const usuarios = await leerUsuarios();

    const usuarioExistente = usuarios.find(
        u => u.usuario === usuario
    );

    if (usuarioExistente) {
        const error = new Error('El usuario ya existe');
        error.status = 409;
        throw error;
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
        id: Date.now(),
        usuario,
        password: passwordEncriptada
    };

    usuarios.push(nuevoUsuario);

    await guardarUsuarios(usuarios);

    res.status(201).json({
        mensaje: 'Usuario registrado exitosamente'
    });
}));

// INICIO DE SESIÓN
app.post('/login', asyncHandler(async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        const error = new Error('Debes proporcionar usuario y contraseña');
        error.status = 400;
        throw error;
    }

    const usuarios = await leerUsuarios();

    const usuarioEncontrado = usuarios.find(
        u => u.usuario === usuario
    );

    if (!usuarioEncontrado) {
        const error = new Error('Usuario o contraseña incorrectos');
        error.status = 401;
        throw error;
    }

    const passwordCorrecta = await bcrypt.compare(
        password,
        usuarioEncontrado.password
    );

    if (!passwordCorrecta) {
        const error = new Error('Usuario o contraseña incorrectos');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            id: usuarioEncontrado.id,
            usuario: usuarioEncontrado.usuario
        },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({
        mensaje: 'Inicio de sesión exitoso',
        token
    });
}));

// PROTEGER TODAS LAS RUTAS DE TAREAS
app.use('/tareas', verificarToken);

// OBTENER TODAS LAS TAREAS
app.get('/tareas', asyncHandler(async (req, res) => {
    const tareas = await leerTareas();
    res.json(tareas);
}));

// CREAR UNA TAREA
app.post('/tareas', asyncHandler(async (req, res) => {
    const { titulo, descripcion } = req.body;

    if (!titulo) {
        const error = new Error('El título es obligatorio');
        error.status = 400;
        throw error;
    }

    const tareas = await leerTareas();

    const nuevaTarea = {
        id: Date.now(),
        titulo,
        descripcion: descripcion || '',
        completada: false
    };

    tareas.push(nuevaTarea);

    await guardarTareas(tareas);

    res.status(201).json(nuevaTarea);
}));

// ACTUALIZAR UNA TAREA
app.put('/tareas/:id', asyncHandler(async (req, res) => {
    const tareas = await leerTareas();

    const indice = tareas.findIndex(
        tarea => String(tarea.id) === req.params.id
    );

    if (indice === -1) {
        const error = new Error('Tarea no encontrada');
        error.status = 404;
        throw error;
    }

    const { titulo, descripcion, completada } = req.body;

    tareas[indice] = {
        ...tareas[indice],
        ...(titulo !== undefined && { titulo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(completada !== undefined && { completada })
    };

    await guardarTareas(tareas);

    res.json(tareas[indice]);
}));

// ELIMINAR UNA TAREA
app.delete('/tareas/:id', asyncHandler(async (req, res) => {
    const tareas = await leerTareas();

    const tareasFiltradas = tareas.filter(
        tarea => String(tarea.id) !== req.params.id
    );

    if (tareas.length === tareasFiltradas.length) {
        const error = new Error('Tarea no encontrada');
        error.status = 404;
        throw error;
    }

    await guardarTareas(tareasFiltradas);

    res.json({
        mensaje: 'Tarea eliminada exitosamente'
    });
}));

// MANEJO DE RUTAS INEXISTENTES
app.use((req, res, next) => {
    const error = new Error('Ruta no encontrada');
    error.status = 404;
    next(error);
});

// MIDDLEWARE PERSONALIZADO DE ERRORES
app.use((error, req, res, next) => {
    console.error(error);

    res.status(error.status || 500).json({
        error: error.message || 'Error interno del servidor'
    });
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});