// src/routes/userAuthRoutes

// Importa el módulo 'express' para manejar las rutas HTTP en la aplicación
const express = require('express');

// Crea una instancia del enrutador de Express para definir rutas
const router = express.Router();

// Importa el controlador de autenticación del usuario para manejar la lógica de registro e inicio de sesión
const userAuthController = require('../controllers/userAuthController');

// Ruta para registrar un nuevo usuario
// Cuando el cliente envía una solicitud POST a '/register', se ejecuta el método registerUser del controlador
// Este método se encarga de procesar el registro de un nuevo usuario en la base de datos o validaciones necesarias
router.post('/register', userAuthController.registerUser);

// Ruta para iniciar sesión con un usuario existente
// Cuando el cliente envía una solicitud POST a '/login', se ejecuta el método loginUser del controlador
// Este método valida las credenciales del usuario y devuelve una respuesta adecuada (por ejemplo, un token)
router.post('/login', userAuthController.loginUser);

// Exporta el enrutador para que pueda ser utilizado en la configuración de la aplicación principal
module.exports = router;
