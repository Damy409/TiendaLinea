/**
 * InvoicesController - Controlador para manejar facturación y el historial de compras.
 * 
 * Este controlador utiliza el modelo de facturas (`BillModel`) para crear nuevas facturas
 * y recuperar el historial de compras de un usuario. También interactúa con el modelo de carrito
 * (`CartModel`) para limpiar el carrito después de una compra.
 */

const fs = require('fs').promises; // Módulo para operaciones con archivos usando promesas.
const path = require('path'); // Módulo para manejar rutas de archivos.
const BillModel = require('../models/invoicesModel'); // Modelo para manejar datos de facturas.
const CartModel = require('../models/shoppingCartModel'); // Modelo para manejar datos del carrito.

const DATA_DIR = path.join(__dirname, '../database'); // Directorio donde se almacenan los datos.
const BILLS_FILE = path.join(DATA_DIR, 'invoicesData.json'); // Archivo donde se guardan las facturas.

class BillController {
    /**
     * init - Inicializa el sistema de facturación.
     * 
     * Este método asegura que el archivo donde se almacenan las facturas exista.
     * Si no existe, se crea un archivo vacío.
     */
    static async init() {
        try {
            // Crear directorio para almacenar datos, si no existe.
            await fs.mkdir(DATA_DIR, { recursive: true });

            try {
                // Verificar si el archivo de facturas existe.
                await fs.access(BILLS_FILE);
            } catch {
                // Crear un archivo vacío si no existe.
                await fs.writeFile(BILLS_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando BillController:', error);
            throw error; // Propagar error para ser manejado externamente.
        }
    }

    /**
     * createBill - Crea una nueva factura a partir de los elementos en el carrito.
     * 
     * Este método genera una factura para el usuario autenticado, basándose en los
     * elementos presentes en su carrito. Posteriormente, limpia el carrito.
     * 
     * @param {Object} req - Objeto de solicitud de Express, con `req.user.email` para identificar al usuario.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    static async createBill(req, res) {
        try {
            const userEmail = req.user.email; // Email del usuario autenticado.

            // Obtener los elementos del carrito del usuario.
            const cartItems = await CartModel.getCart(userEmail);

            // Crear una nueva factura utilizando el modelo de facturas.
            const bill = await BillModel.createBill(userEmail, cartItems);

            // Limpiar el carrito después de la compra.
            await CartModel.clearCart(userEmail);

            // Enviar la factura creada como respuesta.
            res.status(201).json({ message: 'Compra realizada con éxito', bill });
        } catch (error) {
            console.error('Error creanod factura:', error);
            res.status(500).json({ 
                message: 'Error procesando la compra', // Mensaje de error genérico.
                error: error.message // Incluir detalles del error para debugging.
            });
        }
    }

    /**
     * getBills - Obtiene el historial de compras del usuario autenticado.
     * 
     * Este método recupera todas las facturas asociadas al usuario autenticado.
     * 
     * @param {Object} req - Objeto de solicitud de Express, con `req.user.email` para identificar al usuario.
     * @param {Object} res - Objeto de respuesta de Express.
     */
    static async getBills(req, res) {
        try {
            const userEmail = req.user.email; // Email del usuario autenticado.

            // Obtener facturas del usuario utilizando el modelo de facturas.
            const bills = await BillModel.getBillsByUser(userEmail);

            // Enviar las facturas como respuesta.
            res.json(bills);
        } catch (error) {
            console.error('Error obteniendo facturas:', error);
            res.status(500).json({ 
                message: 'Error obteniendo el H de compras', // Mensaje de error genérico.
                error: error.message // Incluir detalles del error para debugging.
            });
        }
    }
}

// Exportar el controlador para que pueda ser utilizado en las rutas.
module.exports = BillController;
