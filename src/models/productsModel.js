const fs = require('fs').promises; // Asegúrate de importar fs.promises si no lo has hecho
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data');
const PRODUCTS_FILE_PATH = path.join(DATA_PATH, 'products.json');

class ProductModel {
    /**
     * Inicializa el sistema de productos, asegurándose de que
     * el directorio y archivo de productos existan.
     */
    static async init() {
        try {
            // Crear directorio de datos si no existe
            await fs.mkdir(DATA_PATH, { recursive: true });
            
            // Verificar si el archivo existe, si no, crearlo con un array vacío
            try {
                await fs.access(PRODUCTS_FILE_PATH);
            } catch {
                await fs.writeFile(PRODUCTS_FILE_PATH, '[]', 'utf8');
            }
        } catch (err) {
            console.error('Error al inicializar el modelo de productos:', err);
            throw err; // Propagar el error para manejo en capas superiores
        }
    }

    /**
     * Crea un nuevo producto y lo guarda en el archivo JSON.
     * @param {Object} productData - Información del producto { name, price, image }.
     * @returns {Object} - Producto recién creado.
     */
    static async createProduct(productData) {
        try {
            await this.init(); // Asegurarse de que todo esté inicializado
            const products = await this.getProducts(); // Obtener todos los productos existentes
            
            // Validar que los datos del producto sean completos
            if (!productData.name || !productData.price || !productData.image) {
                throw new Error('Faltan datos del producto');
            }

            // Crear un nuevo producto con un ID único
            const newProduct = {
                id: Date.now().toString(),
                name: productData.name,
                price: parseFloat(productData.price),
                image: productData.image,
                createdAt: new Date().toISOString()
            };

            // Agregar el nuevo producto al arreglo
            products.push(newProduct);

            // Guardar la lista de productos actualizada en el archivo
            await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), 'utf8');

            return newProduct;
        } catch (err) {
            console.error('Error al guardar el producto:', err);
            throw err;
        }
    }

    /**
     * Obtiene todos los productos almacenados en el archivo JSON.
     * @returns {Array} - Lista de productos.
     */
    static async getProducts() {
        try {
            await this.init(); // Asegurarse de que todo esté inicializado
            const data = await fs.readFile(PRODUCTS_FILE_PATH, 'utf8'); // Leer el archivo JSON
            return JSON.parse(data); // Parsear el contenido a un array de objetos
        } catch (err) {
            console.error('Error al obtener los productos:', err);
            throw err; // Propagar el error para manejo en capas superiores
        }
    }
}

// Exportar la clase del modelo
module.exports = ProductModel;
