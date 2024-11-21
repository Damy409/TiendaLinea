// src/routes/invoicesRoutes.js

// Importa el módulo 'express' para manejar las rutas HTTP en la aplicación
const express = require('express');

// Crea una instancia del enrutador de Express para definir rutas
const router = express.Router();

// Importa el middleware 'authenticateToken' para asegurar que solo los usuarios autenticados puedan acceder a estas rutas
const { authenticateToken } = require('../middleware/userAuthMiddleware');

// Importa el controlador de facturación para manejar la lógica de las operaciones sobre las facturas
const InvoiceController = require('../controllers/invoicesController');

// Ruta para crear una nueva factura
// La ruta está protegida con el middleware 'authenticateToken' para verificar que el usuario esté autenticado
// Cuando el cliente envía una solicitud POST a '/create', se ejecuta el método createInvoices del controlador
// Este método procesa los datos de la nueva factura y la crea en la base de datos
router.post('/create', authenticateToken, InvoiceController.createInvoices);

// Ruta para obtener las facturas del usuario
// La ruta está protegida con el middleware 'authenticateToken' para verificar que el usuario esté autenticado
// Cuando el cliente envía una solicitud GET a '/', se ejecuta el método getInvoices del controlador
// Este método devuelve las facturas asociadas al usuario autenticado
router.get('/', authenticateToken, InvoiceController.getInvoices);

// Exporta el enrutador para que pueda ser utilizado en la configuración de la aplicación principal
module.exports = router;
