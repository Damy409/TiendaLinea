const fs = require('fs').promises;
const path = require('path');
const invoices = require('../models/invoicesModel');
const shoppingCart = require('../models/shoppingCartModel');

const dataDir = path.join(__dirname, '../data');
const billsFile = path.join(dataDir, 'bills.json');

class InvoiceController {
    /**
     * Inicializa el sistema asegurándose de que el directorio de datos y el archivo de facturas existan.
     */
    static async init() {
        try {
            await fs.mkdir(dataDir, { recursive: true });
            try {
                await fs.access(billsFile);
            } catch {
                await fs.writeFile(billsFile, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error en la configuración de InvoiceController:', error);
            throw error;
        }
    }

    /**
     * Crea una nueva factura para el usuario y vacía el carrito de compras.
     */
    static async createInvoices(req, res) {
        const userEmail = req.user.email;
        try {
            const cartItems = await shoppingCart.getShoppingCart(userEmail);
            const invoice = await invoices.createInvoice(userEmail, cartItems);
            await shoppingCart.clearShoppingCart(userEmail);

            res.status(201).json({ message: 'Compra realizada con éxito', invoice });
        } catch (error) {
            console.error('Error al crear la factura:', error);
            res.status(500).json({ message: 'Error procesando la compra', error: error.message });
        }
    }

    /**
     * Obtiene las facturas del usuario autenticado.
     */
    static async getInvoices(req, res) {
        const userEmail = req.user.email;
        try {
            const userInvoices = await invoices.getInvoicesByUser(userEmail);
            res.json(userInvoices);
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            res.status(500).json({ message: 'Error al obtener el historial de compras', error: error.message });
        }
    }
}

module.exports = InvoiceController;
