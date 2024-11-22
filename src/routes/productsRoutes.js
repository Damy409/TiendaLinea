// src/routes/productsRoutes.js

// Importa el módulo 'express' para manejar las rutas HTTP en la aplicación
const express = require('express');

// Crea una instancia del enrutador de Express para definir rutas
const router = express.Router();

// Importa los middlewares 'authenticateToken' e 'isAdmin' para asegurar que solo los usuarios autenticados y administradores puedan acceder a ciertas rutas
const { authenticateToken, isAdmin } = require('../middleware/userAuthMiddleware');

// Importa el controlador de productos para manejar la lógica de las operaciones sobre los productos
const productsController = require('../controllers/productsController');

// Ruta para obtener todos los productos
// Esta ruta está disponible para todos los usuarios (no requiere autenticación)
// Cuando el cliente envía una solicitud GET a '/', se ejecuta el método getAllProducts del controlador
// Este método devuelve la lista de productos disponibles en la base de datos
router.get('/', productsController.getAllProducts);

// Ruta para crear un nuevo producto
// La ruta está protegida con los middlewares 'authenticateToken' e 'isAdmin' para asegurar que solo los usuarios autenticados y con rol de administrador puedan crear productos
// Cuando el cliente envía una solicitud POST a '/', se ejecuta el método createProduct del controlador
// Este método procesa los datos del nuevo producto y lo agrega a la base de datos
router.post('/', authenticateToken, isAdmin, productsController.createProduct);

// Exporta el enrutador para que pueda ser utilizado en la configuración de la aplicación principal
module.exports = router;
