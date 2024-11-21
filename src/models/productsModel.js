const fs = require('fs').promises; // Asegúrate de importar fs.promises si no lo has hecho
const path = require('path');

const DATA_DIRECTORY = path.join(__dirname, '../data');
const PRODUCTS_FILE = path.join(DATA_DIRECTORY, 'products.json');

class ProductModel {
    /**
     * Inicializa el sistema de productos, asegurándose de que
     * el directorio y archivo de productos existan.
     */
    static async init() {
        try {
            // Crear directorio de datos si no existe
            await fs.mkdir(DATA_DIRECTORY, { recursive: true });
            
            // Verificar si el archivo existe, si no, crearlo con un array vacío
            try {
                await fs.access(PRODUCTS_FILE);
            } catch {
                await fs.writeFile(PRODUCTS_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando ProductModel:', error);
            throw error; // Propagar el error para manejo en capas superiores
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
            const products = await this.getAllProducts(); // Obtener todos los productos existentes
            
            // Validar que los datos del producto sean completos
            if (!productData.name || !productData.price || !productData.image) {
                throw new Error('Datos del producto incompletos');
            }

            const newProduct = {
                id: Date.now().toString(), // Usar timestamp como ID único
                name: productData.name,
                price: parseFloat(productData.price), // Asegurar que el precio sea numérico
                image: productData.image,
                createdAt: new Date().toISOString() // Registrar fecha de creación
            };

            // Agregar nuevo producto al array de productos
            products.push(newProduct);
            
            // Guardar productos actualizados en el archivo
            await fs.writeFile(
                PRODUCTS_FILE, 
                JSON.stringify(products, null, 2) + '\n', // Formato legible
                'utf8'
            );
            
            return newProduct;
        } catch (error) {
            console.error('Error al crear el producto:', error);
            throw error; // Propagar el error para manejo en capas superiores
        }
    }

    /**
     * Obtiene todos los productos almacenados en el archivo JSON.
     * @returns {Array} - Lista de productos.
     */
    static async getAllProducts() {
        try {
            await this.init(); // Asegurarse de que todo esté inicializado
            const data = await fs.readFile(PRODUCTS_FILE, 'utf8'); // Leer el archivo JSON
            return JSON.parse(data); // Parsear el contenido a un array de objetos
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            throw error; // Propagar el error para manejo en capas superiores
        }
    }
}

// Exportar la clase para su uso en otros módulos
module.exports = ProductModel;
