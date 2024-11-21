const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/userAuthMiddleware');
const InvoiceController = require('../controllers/invoicesController');

router.post('/create', authenticateToken, InvoiceController.createInvoices);
router.get('/', authenticateToken, InvoiceController.getInvoices);

module.exports = router;