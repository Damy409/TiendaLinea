/**
 * ShoopingCartController - Controlador para manejar las operaciones relacionadas con el carrito de compras.
 * 
 * Este controlador incluye las funcionalidades para obtener los elementos del carrito,
 * agregar productos al carrito, actualizar cantidades, eliminar productos, realizar el checkout
 * y consultar el historial de compras.
 */

const CartModel = require('../models/shoppingCartModel'); // Modelo del carrito de compras.
const path = require('path'); // Para manejo de rutas de archivos.
const fs = require('fs').promises; // Para operaciones con archivos usando promesas.

const BILLS_FILE = path.join(__dirname, '../database/invoicesData.json'); // Archivo para almacenar facturas.

/**
 * getCart - Obtiene los productos en el carrito del usuario autenticado.
 * 
 * @param {Object} req - Objeto de solicitud de Express, con `req.user.email` para identificar al usuario.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.getCart = async (req, res) => {
    try {
        const userEmail = req.user.email; // Email del usuario autenticado.
        const cartItems = await CartModel.getCart(userEmail); // Obtener productos del carrito.
        res.json(cartItems); // Enviar productos como respuesta.
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener el carrito',
            error: error.message 
        });
    }
};

/**
 * addToCart - Agrega un producto al carrito del usuario autenticado.
 * 
 * @param {Object} req - Objeto de solicitud con los datos del producto en `req.body`.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.addToCart = async (req, res) => {
    try {
        const userEmail = req.user.email; // Email del usuario autenticado.
        const product = req.body; // Datos del producto enviado en el cuerpo de la solicitud.
        const updatedCart = await CartModel.addToCart(userEmail, product); // Agregar producto al carrito.
        res.json(updatedCart); // Enviar carrito actualizado como respuesta.
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al agregar a tu carrito',
            error: error.message 
        });
    }
};

/**
 * updateQuantity - Actualiza la cantidad de un producto en el carrito.
 * 
 * @param {Object} req - Objeto de solicitud con `productId` y `quantity` en el cuerpo.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.updateQuantity = async (req, res) => {
    try {
        const userEmail = req.user.email; // Email del usuario autenticado.
        const { productId, quantity } = req.body; // ID del producto y nueva cantidad.
        const updatedCart = await CartModel.updateQuantity(userEmail, productId, quantity);
        res.json(updatedCart); // Enviar carrito actualizado como respuesta.
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al actualizar cantidad',
            error: error.message 
        });
    }
};

/**
 * removeFromCart - Elimina un producto del carrito del usuario autenticado.
 * 
 * @param {Object} req - Objeto de solicitud con `productEmail` en los parámetros.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.removeFromCart = async (req, res) => {
    try {
        const userEmail = req.user.email; // Email del usuario autenticado.
        const { productEmail } = req.params; // Email del producto a eliminar.
        const updatedCart = await CartModel.removeFromCart(userEmail, productEmail);
        res.json(updatedCart); // Enviar carrito actualizado como respuesta.
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al eliminar del carrito',
            error: error.message 
        });
    }
};

/**
 * initBills - Inicializa el archivo de facturas si no existe.
 */
async function initBills() {
    try {
        await fs.access(BILLS_FILE); // Verificar si el archivo existe.
    } catch {
        await fs.writeFile(BILLS_FILE, '[]', 'utf8'); // Crear archivo vacío si no existe.
    }
}

/**
 * checkout - Procesa la compra de los productos en el carrito.
 * 
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.checkout = async (req, res) => {
    try {
        await initBills(); // Asegurar que el archivo de facturas está listo.
        const userEmail = req.user.email; // Email del usuario autenticado.
        const cartItems = await CartModel.getCart(userEmail); // Obtener productos del carrito.

        if (!cartItems.length) {
            return res.status(400).json({ message: 'Tu carrito está vacío.' }); // Error si no hay productos.
        }

        // Crear factura.
        const bill = {
            id: Date.now(), // ID único basado en la marca de tiempo.
            userEmail: userEmail,
            items: cartItems,
            total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), // Calcular total.
            createdAt: new Date().toISOString() // Fecha de creación.
        };

        // Guardar factura en el archivo.
        const billsData = JSON.parse(await fs.readFile(BILLS_FILE, 'utf8'));
        billsData.push(bill);
        await fs.writeFile(BILLS_FILE, JSON.stringify(billsData, null, 2), 'utf8');

        // Vaciar carrito.
        await CartModel.clearCart(userEmail);

        res.json({ message: 'Compra realizada con éxito', bill });
    } catch (error) {
        console.error('Error en el checkout:', error);
        res.status(500).json({ message: 'Error realizando la compra.' });
    }
};

/**
 * getPurchaseHistory - Obtiene el historial de compras del usuario autenticado.
 * 
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.getPurchaseHistory = async (req, res) => {
    try {
        await initBills(); // Asegurar que el archivo de facturas está listo.
        const userEmail = req.user.email; // Email del usuario autenticado.
        const billsData = JSON.parse(await fs.readFile(BILLS_FILE, 'utf8'));
        const userBills = billsData.filter(bill => bill.userEmail === userEmail); // Filtrar facturas del usuario.
        res.json(userBills); // Enviar historial de compras como respuesta.
    } catch (error) {
        console.error('Error obteniendo el historial de compras:', error);
        res.status(500).json({ message: 'Error obteniendo el historial de compras.' });
    }
};
