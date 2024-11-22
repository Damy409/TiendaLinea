// src/controllers/cartController.js
const CartModel = require('../models/shoppingCartModel');

exports.getCart = async (req, res) => {
    try {
        const userEmail = req.user.email; // ID del usuario autenticado
        const cartItems = await CartModel.getCart(userEmail);
        res.json(cartItems); // Solo los productos del carrito del usuario
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener el carrito',
            error: error.message 
        });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userEmail = req.user.email; // Obtener el email del usuario autenticado
        const product = req.body;
        const updatedCart = await CartModel.addToCart(userEmail, product);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al agregar al carrito',
            error: error.message 
        });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId, quantity } = req.body; // Changed from productEmail
        const updatedCart = await CartModel.updateQuantity(userEmail, productId, quantity);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al actualizar cantidad',
            error: error.message 
        });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productEmail } = req.params;
        const updatedCart = await CartModel.removeFromCart(userEmail, productEmail);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al eliminar del carrito',
            error: error.message 
        });
    }
};

const path = require('path');
const fs = require('fs').promises;

const BILLS_FILE = path.join(__dirname, '../database/invoicesData.json');

// Inicialización del archivo bills.json
async function initBills() {
    try {
        await fs.access(BILLS_FILE);
    } catch {
        await fs.writeFile(BILLS_FILE, '[]', 'utf8');
    }
}


exports.checkout = async (req, res) => {
    try {
        await initBills();
        const userEmail = req.user.email;
        const cartItems = await CartModel.getCart(userEmail);

        if (!cartItems.length) {
            return res.status(400).json({ message: 'El carrito está vacío.' });
        }

        // Crear factura
        const bill = {
            id: Date.now(),
            userEmail: userEmail,
            items: cartItems,
            total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
            createdAt: new Date().toISOString()
        };

        // Guardar factura
        const billsData = JSON.parse(await fs.readFile(BILLS_FILE, 'utf8'));
        billsData.push(bill);
        await fs.writeFile(BILLS_FILE, JSON.stringify(billsData, null, 2), 'utf8');

        // Limpiar carrito
        await CartModel.clearCart(userEmail);

        res.json({ message: 'Compra realizada con éxito', bill });
    } catch (error) {
        console.error('Error en el checkout:', error);
        res.status(500).json({ message: 'Error procesando la compra.' });
    }
};

exports.getPurchaseHistory = async (req, res) => {
    try {
        await initBills();
        const userEmail = req.user.email;
        const billsData = JSON.parse(await fs.readFile(BILLS_FILE, 'utf8'));
        const userBills = billsData.filter(bill => bill.userEmail === userEmail);
        res.json(userBills);
    } catch (error) {
        console.error('Error al obtener historial de compras:', error);
        res.status(500).json({ message: 'Error obteniendo el historial de compras.' });
    }
};
