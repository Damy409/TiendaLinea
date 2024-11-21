const fs = require('fs').promises;
const path = require('path');

const DATA_DIRECTORY = path.join(__dirname, '../data');
const SHOPPING_CART_FILE = path.join(DATA_DIRECTORY, 'cart.json');

class CartModel {
    static async init() {
        try {
            await fs.mkdir(DATA_DIRECTORY, { recursive: true });
            try {
                await fs.access(SHOPPING_CART_FILE);
            } catch {
                await fs.writeFile(SHOPPING_CART_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando CartModel:', error);
            throw error;
        }
    }

    static async getShoppingCart(emailU) {
        try {
            await this.init();
            const database = await fs.readFile(SHOPPING_CART_FILE, 'utf8');
            const shoppingcarts = JSON.parse(database);

            const userCart = shoppingcarts.find(cart => cart.emailU === emailU);
            return userCart ? userCart.items : [];
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            throw error;
        }
    }

    static async addToShoppingCart(emailU, product) {
        try {
            await this.init();
            const database = await fs.readFile(SHOPPING_CART_FILE, 'utf8');
            const shoppingcarts = JSON.parse(database);

            const cartIndex = shoppingcarts.findIndex(cart => cart.emailU === emailU);

            if (cartIndex === -1) {
                // Crear un nuevo carrito para el usuario
                const newCart = {
                    emailU,
                    items: [{ ...product, quantity: 1 }]
                };
                shoppingcarts.push(newCart);
            } else {
                // Verificar si el producto ya existe en el carrito
                const existingItemIndex = shoppingcarts[cartIndex].items.findIndex(
                    item => item.id === product.id
                );

                if (existingItemIndex !== -1) {
                    // Incrementar la cantidad si el producto ya existe
                    shoppingcarts[cartIndex].items[existingItemIndex].quantity += 1;
                } else {
                    // Agregar el producto al carrito
                    shoppingcarts[cartIndex].items.push({ ...product, quantity: 1 });
                }
            }

            await fs.writeFile(SHOPPING_CART_FILE, JSON.stringify(shoppingcarts, null, 2), 'utf8');
            return shoppingcarts.find(cart => cart.emailU === emailU).items;
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            throw error;
        }
    }

    static async updateQuantity(emailU, productId, newQuantity) {
        try {
            await this.init();
            const database = await fs.readFile(SHOPPING_CART_FILE, 'utf8');
            const shoppingcarts = JSON.parse(database);

            const cartIndex = shoppingcarts.findIndex(cart => cart.emailU === emailU);
            if (cartIndex === -1) {
                throw new Error('Carrito no encontrado para este usuario.');
            }

            const itemIndex = shoppingcarts[cartIndex].items.findIndex(item => item.id === productId);
            if (itemIndex === -1) {
                throw new Error('Producto no encontrado en el carrito.');
            }

            if (newQuantity <= 0) {
                shoppingcarts[cartIndex].items.splice(itemIndex, 1); // Eliminar producto
            } else {
                shoppingcarts[cartIndex].items[itemIndex].quantity = newQuantity; // Actualizar cantidad
            }

            await fs.writeFile(SHOPPING_CART_FILE, JSON.stringify(shoppingcarts, null, 2), 'utf8');
            return shoppingcarts[cartIndex].items;
        } catch (error) {
            console.error('Error al actualizar la cantidad del producto:', error);
            throw error;
        }
    }

    static async removeFromShoppingCart(emailU, productId) {
        try {
            await this.init();
            const database = await fs.readFile(SHOPPING_CART_FILE, 'utf8');
            const shoppingcarts = JSON.parse(database);

            const cartIndex = shoppingcarts.findIndex(cart => cart.emailU === emailU);
            if (cartIndex === -1) {
                throw new Error('Carrito no encontrado para este usuario.');
            }

            // Filtrar el producto que se desea eliminar
            shoppingcarts[cartIndex].items = shoppingcarts[cartIndex].items.filter(
                item => item.id !== productId
            );

            await fs.writeFile(SHOPPING_CART_FILE, JSON.stringify(shoppingcarts, null, 2), 'utf8');
            return shoppingcarts[cartIndex].items;
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);
            throw error;
        }
    }

    static async clearShoppingCart(emailU) {
        try {
            await this.init();
            const database = await fs.readFile(SHOPPING_CART_FILE, 'utf8');
            const shoppingcarts = JSON.parse(database);

            const cartIndex = shoppingcarts.findIndex(cart => cart.emailU === emailU);
            if (cartIndex !== -1) {
                shoppingcarts[cartIndex].items = []; // Vaciar el carrito
            }

            await fs.writeFile(SHOPPING_CART_FILE, JSON.stringify(shoppingcarts, null, 2), 'utf8');
            return [];
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
            throw error;
        }
    }
}

module.exports = CartModel;
