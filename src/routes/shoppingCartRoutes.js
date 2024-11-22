// src/routes/shoppingCartRoutes.js

// Importa el módulo 'express' para manejar las rutas HTTP en la aplicación
const express = require('express');

// Crea una instancia del enrutador de Express para definir rutas
const router = express.Router();

// Importa el middleware 'authenticateToken' para asegurar que solo los usuarios autenticados puedan acceder a estas rutas
const { authenticateToken } = require('../middleware/userAuthMiddleware');

// Importa el controlador de carrito de compras para manejar la lógica de las operaciones sobre el carrito
const shoppingCartController = require('../controllers/shoppingCartController');

// Ruta para obtener el carrito de compras del usuario
// La ruta usa el middleware 'authenticateToken' para asegurar que solo los usuarios autenticados puedan acceder a la información del carrito
// Cuando el cliente envía una solicitud GET a '/', se ejecuta el método getShoppingCart del controlador
// Este método devuelve los productos actuales en el carrito de compras del usuario autenticado
router.get('/', authenticateToken, shoppingCartController.getCart);

// Ruta para agregar un producto al carrito de compras
// La ruta usa el middleware 'authenticateToken' para verificar que el usuario esté autenticado
// Cuando el cliente envía una solicitud POST a '/add', se ejecuta el método addToShoppingCart del controlador
// Este método agrega el producto especificado al carrito de compras del usuario autenticado
router.post('/add', authenticateToken, shoppingCartController.addToCart);

// Ruta para actualizar la cantidad de un producto en el carrito de compras
// La ruta usa el middleware 'authenticateToken' para verificar la autenticación del usuario
// Cuando el cliente envía una solicitud PUT a '/update', se ejecuta el método updateQuantity del controlador
// Este método actualiza la cantidad de un producto en el carrito de compras del usuario autenticado
router.put('/update', authenticateToken, shoppingCartController.updateQuantity);

// Ruta para eliminar un producto del carrito de compras
// La ruta usa el middleware 'authenticateToken' para verificar que el usuario esté autenticado
// Cuando el cliente envía una solicitud DELETE a '/remove/:productId', se ejecuta el método removeFromShoppingCart del controlador
// Este método elimina el producto con el ID especificado del carrito de compras del usuario autenticado
router.delete('/remove/:productId', authenticateToken, shoppingCartController.removeFromCart);

// Exporta el enrutador para que pueda ser utilizado en la configuración de la aplicación principal
module.exports = router;
