const fs = require('fs').promises; // Asegúrate de importar fs.promises si no lo has hecho
const path = require('path');

const DATA_PATH = path.join(__dirname, '../database');
const PRODUCTS_FILE = path.join(DATA_PATH, 'products.json');

class ProductModel {

    static async init() {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            
            try {
                await fs.access(PRODUCTS_FILE);
            } catch {
                await fs.writeFile(PRODUCTS_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando ProductModel:', error);
            throw error; // Propagar el error
        }
    }


    static async createProduct(productData) {
        try {
            await this.init();
            const products = await this.getAllProducts();
            
            // Validar datos
            if (!productData.name || !productData.price || !productData.image) {
                throw new Error('Datos del producto incompletos');
            }

            const newProduct = {
                id: Date.now().toString(),
                name: productData.name,
                price: parseFloat(productData.price), // Asegurar que el precio es número
                image: productData.image,
                createdAt: new Date().toISOString()
            };

            products.push(newProduct);
            
            // Usar writeFile con encoding UTF-8 y agregar salto de línea al final
            await fs.writeFile(
                PRODUCTS_FILE, 
                JSON.stringify(products, null, 2) + '\n', 
                'utf8'
            );
            
            return newProduct;
        } catch (error) {
            console.error('Error al crear el producto:', error);
            throw error; // Propagar el error para mejor manejo
        }
    }

    static async getAllProducts() {
        try {
            await this.init();
            const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            throw error;
        }
    }
}

// Exportar la clase del modelo
module.exports = ProductModel;
