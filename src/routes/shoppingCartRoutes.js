// src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/userAuthMiddleware');
const shoppingCartController = require('../controllers/shoppingCartController');

router.get('/', authenticateToken, shoppingCartController.getShoppingCart);
router.post('/add', authenticateToken, shoppingCartController.addToShoppingCart);
router.put('/update', authenticateToken, shoppingCartController.updateQuantity);
router.delete('/remove/:productId', authenticateToken, shoppingCartController.removeFromShoppingCart);

module.exports = router;
