const fs = require('fs').promises;
const path = require('path');
const invoicesModel = require('../models/invoicesModel');
const shoppingCartModel = require('../models/shoppingCartModel');

const DATA_DIRECTORY = path.join(__dirname, '../data');
const INVOICES_FILE = path.join(DATA_DIRECTORY, 'bills.json');

class InvoiceController {
    /**
     * Inicializa el sistema asegurándose de que el directorio de datos y el archivo de facturas existan.
     */
    static async init() {
        try {
            await fs.mkdir(DATA_DIRECTORY, { recursive: true });
            try {
                await fs.access(INVOICES_FILE);
            } catch {
                await fs.writeFile(INVOICES_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error al inicializar InvoiceController:', error);
            throw error;
        }
    }

    /**
     * Crea una nueva factura para el usuario y vacía el carrito de compras.
     */
    static async createInvoices(req, res) {
        try {
            const userEmail = req.user.email;
            const shoppingCartItems = await shoppingCartModel.getShoppingCart(userEmail);

            const invoice = await invoicesModel.createInvoice(userEmail, shoppingCartItems);

            // Limpiar carrito después de la compra
            await shoppingCartModel.clearShoppingCart(userEmail);

            res.status(201).json({ message: 'Compra realizada con éxito', invoice });
        } catch (error) {
            console.error('Error al crear la factura:', error);
            res.status(500).json({
                message: 'Error al procesar la compra',
                error: error.message
            });
        }
    }

    /**
     * Obtiene las facturas del usuario autenticado.
     */
    static async getInvoices(req, res) {
        try {
            const userEmail = req.user.email;
            const invoices = await invoicesModel.getInvoicesByUser(userEmail);

            res.json(invoices);
        } catch (error) {
            console.error('Error al obtener las facturas:', error);
            res.status(500).json({
                message: 'Error al obtener el historial de compras',
                error: error.message
            });
        }
    }
}

module.exports = InvoiceController;
