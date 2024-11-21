const path = require('path');
const fs = require('fs').promises;
const CartModel = require('../models/shoppingCartModel');

const INVOICES_FILE = path.join(__dirname, '../data/bills.json');

// Inicialización del archivo bills.json
async function initInvoices() {
    try {
        await fs.access(INVOICES_FILE);
    } catch {
        await fs.writeFile(INVOICES_FILE, '[]', 'utf8');
    }
}

exports.getShoppingCart = async (req, res) => {
    try {
        const userEmail = req.user.email; // ID del usuario autenticado
        const shoppingCartItems = await CartModel.getShoppingCart(userEmail);
        res.json(shoppingCartItems);
    } catch (error) {
        res.status(500).json({ 
            message: 'Se produjo un error al obtener el carrito.',
            error: error.message 
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
    } catch (error) {
        res.status(500).json({ 
            message: 'Se produjo un error al agregar al carrito.',
            error: error.message 
        });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId, quantity } = req.body;

        if (!productId || quantity == null) {
            return res.status(400).json({ 
                message: 'Se requiere el ID del producto y la cantidad.' 
            });
        }

        const updatedCart = await CartModel.updateQuantity(userEmail, productId, quantity);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ 
            message: 'Se produjo un error al actualizar la cantidad.',
            error: error.message 
        });
    }
};

exports.removeFromShoppingCart = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ 
                message: 'Se requiere el ID del producto para eliminarlo.' 
            });
        }

        const updatedCart = await CartModel.removeFromShoppingCart(userEmail, productId);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ 
            message: 'Se produjo un error al eliminar el producto del carrito.',
            error: error.message 
        });
    }
};

exports.checkout = async (req, res) => {
    try {
        await initInvoices();
        const userEmail = req.user.email;
        const cartItems = await CartModel.getShoppingCart(userEmail);

        if (!cartItems.length) {
            return res.status(400).json({ message: 'El carrito está vacío.' });
        }

        // Crear factura
        const invoice = {
            id: Date.now(),
            userEmail,
            items: cartItems,
            total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
            createdAt: new Date().toISOString(),
        };

        // Guardar factura
        const billsData = JSON.parse(await fs.readFile(INVOICES_FILE, 'utf8'));
        billsData.push(invoice);
        await fs.writeFile(INVOICES_FILE, JSON.stringify(billsData, null, 2), 'utf8');

        // Limpiar carrito
        await CartModel.clearShoppingCart(userEmail);

        res.json({ message: 'La compra fue realizada con éxito.', invoice });
    } catch (error) {
        console.error('Se produjo un error en el checkout:', error);
        res.status(500).json({ message: 'Error al procesar la compra.' });
    }
};

exports.getPurchaseHistory = async (req, res) => {
    try {
        await initInvoices();
        const userEmail = req.user.email;
        const billsData = JSON.parse(await fs.readFile(INVOICES_FILE, 'utf8'));
        const userBills = billsData.filter(bill => bill.userEmail === userEmail);
        res.json(userBills);
    } catch (error) {
        console.error('Se produjo un error al obtener el historial de compras:', error);
        res.status(500).json({ message: 'Error al obtener el historial de compras.' });
    }
};
