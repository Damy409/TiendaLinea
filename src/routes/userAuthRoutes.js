//src/routes/authRoutes
const express = require('express');
const router = express.Router();
const userAuthController = require('../controllers/userAuthController');

router.post('/register', userAuthController.registerUser);
router.post('/login', userAuthController.loginUser);

module.exports = router;
