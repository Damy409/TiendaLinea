const { promises: fs } = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const CART_FILE_PATH = path.join(DATA_DIR, 'cart.json');

class CartModel {
    static async init() {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            try {
                await fs.access(CART_FILE_PATH);
            } catch {
                await fs.writeFile(CART_FILE_PATH, '[]', 'utf8');
            }
        } catch (err) {
            console.error('Error en la inicialización del modelo de carrito:', err);
            throw err;
        }
    }

    static async getShoppingCart(userEmail) {
        try {
            await this.init();
            const fileContent = await fs.readFile(CART_FILE_PATH, 'utf8');
            const carts = JSON.parse(fileContent);

            const userCart = carts.find(cart => cart.userEmail === userEmail);
            return userCart ? userCart.items : [];
        } catch (err) {
            console.error('Error al obtener el carrito:', err);
            throw err;
        }
    }

    static async addToShoppingCart(userEmail, product) {
        try {
            await this.init();
            const fileContent = await fs.readFile(CART_FILE_PATH, 'utf8');
            const carts = JSON.parse(fileContent);

            const cartIdx = carts.findIndex(cart => cart.userEmail === userEmail);

            if (cartIdx === -1) {
                const newCart = {
                    userEmail,
                    items: [{ ...product, quantity: 1 }]
                };
                carts.push(newCart);
            } else {
                const productIdx = carts[cartIdx].items.findIndex(item => item.id === product.id);

                if (productIdx !== -1) {
                    carts[cartIdx].items[productIdx].quantity += 1;
                } else {
                    carts[cartIdx].items.push({ ...product, quantity: 1 });
                }
            }

            await fs.writeFile(CART_FILE_PATH, JSON.stringify(carts, null, 2), 'utf8');
            return carts.find(cart => cart.userEmail === userEmail).items;
        } catch (err) {
            console.error('Error al agregar al carrito:', err);
            throw err;
        }
    }

    static async updateQuantity(userEmail, productId, newQuantity) {
        try {
            await this.init();
            const fileContent = await fs.readFile(CART_FILE_PATH, 'utf8');
            const carts = JSON.parse(fileContent);

            const cartIdx = carts.findIndex(cart => cart.userEmail === userEmail);
            if (cartIdx === -1) {
                throw new Error('No se encontró el carrito.');
            }

            const itemIdx = carts[cartIdx].items.findIndex(item => item.id === productId);
            if (itemIdx === -1) {
                throw new Error('Producto no encontrado.');
            }

            if (newQuantity <= 0) {
                carts[cartIdx].items.splice(itemIdx, 1); 
            } else {
                carts[cartIdx].items[itemIdx].quantity = newQuantity; 
            }

            await fs.writeFile(CART_FILE_PATH, JSON.stringify(carts, null, 2), 'utf8');
            return carts[cartIdx].items;
        } catch (err) {
            console.error('Error al actualizar la cantidad del producto:', err);
            throw err;
        }
    }

    static async removeFromShoppingCart(userEmail, productId) {
        try {
            await this.init();
            const fileContent = await fs.readFile(CART_FILE_PATH, 'utf8');
            const carts = JSON.parse(fileContent);

            const cartIdx = carts.findIndex(cart => cart.userEmail === userEmail);
            if (cartIdx === -1) {
                throw new Error('No se encontró el carrito.');
            }

            carts[cartIdx].items = carts[cartIdx].items.filter(item => item.id !== productId);

            await fs.writeFile(CART_FILE_PATH, JSON.stringify(carts, null, 2), 'utf8');
            return carts[cartIdx].items;
        } catch (err) {
            console.error('Error al eliminar el producto del carrito:', err);
            throw err;
        }
    }

    static async clearShoppingCart(userEmail) {
        try {
            await this.init();
            const fileContent = await fs.readFile(CART_FILE_PATH, 'utf8');
            const carts = JSON.parse(fileContent);

            const cartIdx = carts.findIndex(cart => cart.userEmail === userEmail);
            if (cartIdx !== -1) {
                carts[cartIdx].items = []; 
            }

            await fs.writeFile(CART_FILE_PATH, JSON.stringify(carts, null, 2), 'utf8');
            return [];
        } catch (err) {
            console.error('Error al limpiar el carrito:', err);
            throw err;
        }
    }
}

module.exports = CartModel;
