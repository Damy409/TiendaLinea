const fs = require('fs').promises;
const path = require('path');
const BillModel = require('../models/invoicesModel');
const CartModel = require('../models/shoppingCartModel');

const DATA_DIR = path.join(__dirname, '../database');
const BILLS_FILE = path.join(DATA_DIR, 'invoicesData.json');

class BillController {
    static async init() {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            try {
                await fs.access(BILLS_FILE);
            } catch {
                await fs.writeFile(BILLS_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando BillController:', error);
            throw error;
        }
    }

    static async createBill(req, res) {
        try {
            const userEmail = req.user.email;
            const cartItems = await CartModel.getCart(userEmail);
            
            const bill = await BillModel.createBill(userEmail, cartItems);
            
            // Limpiar carrito después de la compra
            await CartModel.clearCart(userEmail);

            res.status(201).json({ message: 'Compra realizada con éxito', bill });
        } catch (error) {
            console.error('Error al crear factura:', error);
            res.status(500).json({ 
                message: 'Error al procesar la compra',
                error: error.message 
            });
        }
    }

    static async getBills(req, res) {
        try {
            const userEmail = req.user.email;
            const bills = await BillModel.getBillsByUser(userEmail);
            
            res.json(bills);
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            res.status(500).json({ 
                message: 'Error al obtener historial de compras',
                error: error.message 
            });
        }
    }
}

module.exports = BillController;
