// Importar módulos necesarios
const { promises: fs } = require('fs'); // Promesas de sistema de archivos para operaciones asíncronas
const path = require('path'); // Módulo para manejar rutas de archivos

// Definición de directorios y archivos
const DATA_DIR = path.resolve(__dirname, '../database'); // Directorio donde se almacenarán los datos
const CART_FILE = path.join(DATA_DIR, 'shoppingCartData.json'); // Archivo JSON para almacenar los carritos de compras

/**
 * Modelo de datos para el carrito de compras.
 * Proporciona métodos para gestionar carritos de usuarios, incluyendo creación, actualización y eliminación.
 */
class CartModel {

    /**
     * Inicializa el entorno, asegurando que el directorio y archivo necesarios existan.
     * Si no existen, los crea.
     */
    static async init() {
        try {
            // Crear el directorio si no existe
            await fs.mkdir(DATA_DIR, { recursive: true });
            try {
                // Verificar si el archivo de carritos existe
                await fs.access(CART_FILE);
            } catch {
                // Crear el archivo con un array vacío si no existe
                await fs.writeFile(CART_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando CartModel:', error);
            throw error;
        }
    }

    /**
     * Obtiene los productos en el carrito de un usuario.
     * @param {string} userEmail - Email del usuario.
     * @returns {Promise<Array>} Lista de productos en el carrito del usuario.
     */
    static async getCart(userEmail) {
        try {
            await this.init(); // Asegura que el entorno está inicializado
            const data = await fs.readFile(CART_FILE, 'utf8'); // Lee el archivo de carritos
            const carts = JSON.parse(data); // Convierte los datos a un objeto
            
            // Busca el carrito del usuario por su email
            const userCart = carts.find(cart => cart.userEmail === userEmail);
            return userCart ? userCart.items : []; // Retorna los productos o un array vacío
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            throw error;
        }
    }

    /**
     * Agrega un producto al carrito de un usuario.
     * @param {string} userEmail - Email del usuario.
     * @param {Object} product - Datos del producto a agregar.
     * @returns {Promise<Array>} Lista actualizada de productos en el carrito del usuario.
     */
    static async addToCart(userEmail, product) {
        try {
            await this.init();
            const data = await fs.readFile(CART_FILE, 'utf8');
            const carts = JSON.parse(data);

            const cartIndex = carts.findIndex(cart => cart.userEmail === userEmail);
            
            if (cartIndex === -1) {
                // Crear un nuevo carrito si no existe para el usuario
                const newCart = {
                    userEmail,
                    items: [{ ...product, quantity: 1 }]
                };
                carts.push(newCart);
            } else {
                // Buscar si el producto ya existe en el carrito
                const existingItemIndex = carts[cartIndex].items.findIndex(
                    item => item.id === product.id
                );
                
                if (existingItemIndex !== -1) {
                    // Incrementar la cantidad si el producto ya existe
                    carts[cartIndex].items[existingItemIndex].quantity += 1;
                } else {
                    // Agregar el nuevo producto al carrito
                    carts[cartIndex].items.push({ ...product, quantity: 1 });
                }
            }

            await fs.writeFile(CART_FILE, JSON.stringify(carts, null, 2), 'utf8');
            const userCart = carts.find(cart => cart.userEmail === userEmail);
            return userCart.items;
        } catch (error) {
            console.error('Error al agregar:', error);
            throw error;
        }
    }

    /**
     * Actualiza la cantidad de un producto en el carrito del usuario.
     * @param {string} userEmail - Email del usuario.
     * @param {string} productId - ID del producto a actualizar.
     * @param {number} newQuantity - Nueva cantidad del producto.
     * @returns {Promise<Array>} Lista actualizada de productos en el carrito.
     */
    static async updateQuantity(userEmail, productId, newQuantity) {
        try {
            await this.init();
            const data = await fs.readFile(CART_FILE, 'utf8');
            const carts = JSON.parse(data);

            const cartIndex = carts.findIndex(cart => cart.userEmail === userEmail);
            if (cartIndex === -1) throw new Error('Tu Carrito no fue encontrado');

            const itemIndex = carts[cartIndex].items.findIndex(item => item.id === productId);
            if (itemIndex === -1) throw new Error('Este producto no fue encontrado en el carrito');

            if (newQuantity <= 0) {
                // Elimina el producto si la cantidad es 0 o menos
                carts[cartIndex].items.splice(itemIndex, 1);
            } else {
                // Actualiza la cantidad del producto
                carts[cartIndex].items[itemIndex].quantity = newQuantity;
            }

            await fs.writeFile(CART_FILE, JSON.stringify(carts, null, 2), 'utf8');
            return carts[cartIndex].items;
        } catch (error) {
            console.error('Error actualizando la cantidad:', error);
            throw error;
        }
    }

    /**
     * Elimina un producto del carrito del usuario.
     * @param {string} userEmail - Email del usuario.
     * @param {string} productEmail - Email del producto a eliminar.
     * @returns {Promise<Array>} Lista actualizada de productos en el carrito.
     */
    static async removeFromCart(userEmail, productEmail) {
        try {
            await this.init();
            const data = await fs.readFile(CART_FILE, 'utf8');
            const carts = JSON.parse(data);

            const cartIndex = carts.findIndex(cart => cart.userEmail === userEmail);
            if (cartIndex === -1) throw new Error('Tu Carrito no fue encontrado');

            // Filtrar el producto a eliminar
            carts[cartIndex].items = carts[cartIndex].items.filter(
                item => item.email !== productEmail
            );

            await fs.writeFile(CART_FILE, JSON.stringify(carts, null, 2), 'utf8');
            return carts[cartIndex].items;
        } catch (error) {
            console.error('Error al limpiar productos del carrito:', error);
            throw error;
        }
    }

    /**
     * Vacía el carrito del usuario.
     * @param {string} userEmail - Email del usuario.
     * @returns {Promise<Array>} Carrito vacío (array vacío).
     */
    static async clearCart(userEmail) {
        try {
            await this.init();
            const data = await fs.readFile(CART_FILE, 'utf8');
            const carts = JSON.parse(data);

            const cartIndex = carts.findIndex(cart => cart.userEmail === userEmail);
            if (cartIndex !== -1) {
                carts[cartIndex].items = []; // Vacía el carrito
            }

            await fs.writeFile(CART_FILE, JSON.stringify(carts, null, 2), 'utf8');
            return [];
        } catch (error) {
            console.error('Error limpiando el carrito:', error);
            throw error;
        }
    }
}

// Exporta el modelo para ser utilizado en otras partes del proyecto
module.exports = CartModel;
