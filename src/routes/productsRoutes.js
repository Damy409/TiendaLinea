const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/userAuthMiddleware');
const productsController = require('../controllers/productsController');

// Rutas para productos
router.get('/', productsController.getProducts); // Obtener todos los productos
router.post('/', authenticateToken, isAdmin, productsController.createProduct);

module.exports = router;


