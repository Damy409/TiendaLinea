const { promises: fs } = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../database');
const CART_FILE = path.join(DATA_DIR, 'shoppingCartData.json');

class CartModel {

    static async init() {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            try {
                await fs.access(CART_FILE);
            } catch {
                await fs.writeFile(CART_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando CartModel:', error);
            throw error;
        }
    }

    static async getCart(userEmail) {
        try {
            await this.init();
            const data = await fs.readFile(CART_FILE, 'utf8');
            const carts = JSON.parse(data);
            
            const userCart = carts.find(cart => cart.userEmail === userEmail);
            return userCart ? userCart.items : [];
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            throw error;
        }
    }

    static async addToCart(userEmail, product) {
        try {
            await this.init();
            const data = await fs.readFile(CART_FILE, 'utf8');
            const carts = JSON.parse(data);
            
            const cartIndex = carts.findIndex(cart => cart.userEmail === userEmail);
            
            if (cartIndex === -1) {
                // Crear nuevo carrito para el usuario
                const newCart = {
                    userEmail: userEmail,
                    items: [{
                        ...product,
                        userEmail: userEmail, // Asegúrate de agregar el email del usuario
                        quantity: 1
                    }]
                };
                carts.push(newCart);
            } else {
                // Verificar si el producto ya existe en el carrito
                const existingItemIndex = carts[cartIndex].items.findIndex(
                    item => item.id === product.id
                );
                
                if (existingItemIndex !== -1) {
                    // Incrementar cantidad si el producto existe
                    carts[cartIndex].items[existingItemIndex].quantity += 1;
                } else {
                    // Agregar nuevo producto con el email del usuario
                    carts[cartIndex].items.push({
                        ...product,
                        userEmail: userEmail,
                        quantity: 1
                    });
                }
            }
    
            await fs.writeFile(CART_FILE, JSON.stringify(carts, null, 2), 'utf8');
            
            const userCart = carts.find(cart => cart.userEmail === userEmail);
            return userCart.items;
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            throw error;
        }
    }

    static async updateQuantity(userEmail, productId, newQuantity) {
        try {
            await this.init();
            const data = await fs.readFile(CART_FILE, 'utf8');
            const carts = JSON.parse(data);
    
            const cartIndex = carts.findIndex(cart => cart.userEmail === userEmail);
            if (cartIndex === -1) {
                throw new Error('Carrito no encontrado');
            }
    
            const itemIndex = carts[cartIndex].items.findIndex(item => item.id === productId);
            if (itemIndex === -1) {
                throw new Error('Producto no encontrado en el carrito');
            }
    
            if (newQuantity <= 0) {
                // Si la cantidad es 0 o menos, eliminar el producto
                carts[cartIndex].items.splice(itemIndex, 1);
            } else {
                // Actualizar la cantidad
                carts[cartIndex].items[itemIndex].quantity = newQuantity;
            }
    
            await fs.writeFile(CART_FILE, JSON.stringify(carts, null, 2), 'utf8');
            return carts[cartIndex].items;
        } catch (error) {
            console.error('Error al actualizar la cantidad:', error);
            throw error;
        }
    }

    static async removeFromCart(userEmail, productEmail) {
        try {
            await this.init();
            const data = await fs.readFile(CART_FILE, 'utf8');
            const carts = JSON.parse(data);
            
            const cartIndex = carts.findIndex(cart => cart.userEmail === userEmail);
            if (cartIndex === -1) {
                throw new Error('Carrito no encontrado');
            }

            // Eliminar producto del carrito
            carts[cartIndex].items = carts[cartIndex].items.filter(
                item => item.email !== productEmail
            );

            await fs.writeFile(CART_FILE, JSON.stringify(carts, null, 2), 'utf8');
            return carts[cartIndex].items;
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            throw error;
        }
    }

    static async clearCart(userEmail) {
        try {
            await this.init();
            const data = await fs.readFile(CART_FILE, 'utf8');
            const carts = JSON.parse(data);
            
            const cartIndex = carts.findIndex(cart => cart.userEmail === userEmail);
            if (cartIndex !== -1) {
                carts[cartIndex].items = []; // Vaciar los items del carrito
            }
    
            await fs.writeFile(CART_FILE, JSON.stringify(carts, null, 2), 'utf8');
            return [];
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
            throw error;
        }
    }
}

module.exports = CartModel;
