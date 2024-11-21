const path = require('path');
const fs = require('fs').promises;
const CartModel = require('../models/shoppingCartModel');

const INVOICES_PATH = path.join(__dirname, '../data/bills.json');

// Inicialización del archivo bills.json
async function initInvoices() {
    try {
        await fs.access(INVOICES_PATH);
    } catch {
        await fs.writeFile(INVOICES_PATH, '[]', 'utf8');
    }
}

exports.getShoppingCart = async (req, res) => {
    try {
        const userEmail = req.user.email; 
        const itemsInCart = await CartModel.getShoppingCart(userEmail);
        res.json(itemsInCart);
    } catch (err) {
        res.status(500).json({ 
            message: 'Error al obtener el carrito.',
            error: err.message 
        });
    }
};

exports.addToShoppingCart = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const product = req.body;

        if (!product || !product.id || !product.quantity) {
            return res.status(400).json({ 
                message: 'Faltan datos del producto (id, quantity).' 
            });
        }

        const updatedCart = await CartModel.addToShoppingCart(userEmail, product);
        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ 
            message: 'Error al agregar al carrito.',
            error: err.message 
        });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId, quantity } = req.body;

        if (!productId || quantity == null) {
            return res.status(400).json({ 
                message: 'Faltan datos para actualizar la cantidad.' 
            });
        }

        const updatedCart = await CartModel.updateQuantity(userEmail, productId, quantity);
        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ 
            message: 'Error al actualizar la cantidad del producto.',
            error: err.message 
        });
    }
};

exports.removeFromShoppingCart = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ 
                message: 'Se necesita el ID del producto para eliminarlo.' 
            });
        }

        const updatedCart = await CartModel.removeFromShoppingCart(userEmail, productId);
        res.json(updatedCart);
    } catch (err) {
        res.status(500).json({ 
            message: 'Error al eliminar el producto del carrito.',
            error: err.message 
        });
    }
};

exports.checkout = async (req, res) => {
    try {
        await initInvoices();
        const userEmail = req.user.email;
        const itemsInCart = await CartModel.getShoppingCart(userEmail);

        if (itemsInCart.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío.' });
        }

        const invoice = {
            id: Date.now(),
            userEmail,
            items: itemsInCart,
            total: itemsInCart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
            createdAt: new Date().toISOString(),
        };

        const existingBills = JSON.parse(await fs.readFile(INVOICES_PATH, 'utf8'));
        existingBills.push(invoice);
        await fs.writeFile(INVOICES_PATH, JSON.stringify(existingBills, null, 2), 'utf8');

        await CartModel.clearShoppingCart(userEmail);

        res.json({ message: 'Compra realizada con éxito.', invoice });
    } catch (err) {
        console.error('Error durante el proceso de checkout:', err);
        res.status(500).json({ message: 'Error al realizar la compra.' });
    }
};

exports.getPurchaseHistory = async (req, res) => {
    try {
        await initializeInvoices();
        const userEmail = req.user.email;
        const existingBills = JSON.parse(await fs.readFile(INVOICES_PATH, 'utf8'));
        const userBills = existingBills.filter(bill => bill.userEmail === userEmail);
        res.json(userBills);
    } catch (err) {
        console.error('Error al obtener el historial de compras:', err);
        res.status(500).json({ message: 'Error al obtener el historial.' });
    }
};
