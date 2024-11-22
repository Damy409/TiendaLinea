/**
 * ProductModel - Clase para manejar la gestión de productos.
 * 
 * Este modelo utiliza un archivo JSON para almacenar información
 * sobre los productos, simulando una base de datos persistente.
 * Incluye métodos para inicializar la estructura de datos,
 * crear nuevos productos y obtener la lista de productos existentes.
 */

// Importaciones necesarias
const { promises: fs } = require('fs'); // Módulo fs para manejo de archivos con Promesas.
const path = require('path'); // Módulo path para manejar rutas de archivos.

// Rutas de los archivos utilizados para el almacenamiento de datos
const DATA_DIR = path.join(__dirname, '../database'); // Directorio donde se almacenarán los datos.
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json'); // Archivo donde se guardarán los productos.

class ProductModel {
    /**
     * Inicializa la estructura de datos.
     * - Crea el directorio donde se almacenarán los archivos si no existe.
     * - Asegura que el archivo `products.json` existe y contiene un arreglo vacío por defecto.
     */
    static async init() {
        try {
            // Crear directorio si no existe.
            await fs.mkdir(DATA_DIR, { recursive: true });

            try {
                // Verificar si el archivo existe.
                await fs.access(PRODUCTS_FILE);
            } catch {
                // Crear el archivo con un arreglo vacío si no existe.
                await fs.writeFile(PRODUCTS_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando ProductModel:', error);
            throw error; // Propagar el error para ser manejado externamente.
        }
    }

    /**
     * Crea un nuevo producto y lo almacena en el archivo `products.json`.
     * 
     * @param {Object} productData - Datos del producto.
     * @param {string} productData.name - Nombre del producto.
     * @param {number|string} productData.price - Precio del producto.
     * @param {string} productData.image - URL de la imagen del producto.
     * @returns {Object} El producto creado con su ID y fecha de creación.
     * @throws Lanza un error si los datos son incompletos o si ocurre un problema al guardar.
     */
    static async createProduct(productData) {
        try {
            await this.init(); // Asegurar que la estructura está lista.
            const products = await this.getAllProducts(); // Obtener productos existentes.

            // Validar que los datos del producto sean válidos.
            if (!productData.name || !productData.price || !productData.image) {
                throw new Error('Datos incompletos');
            }

            // Crear un nuevo producto con un ID único y fecha de creación.
            const newProduct = {
                id: Date.now().toString(), // Generar un ID único basado en la fecha actual.
                name: productData.name,
                price: parseFloat(productData.price), // Convertir el precio a número.
                image: productData.image,
                createdAt: new Date().toISOString() // Agregar marca de tiempo.
            };

            products.push(newProduct); // Agregar el producto a la lista.

            // Guardar la lista actualizada de productos en el archivo JSON.
            await fs.writeFile(
                PRODUCTS_FILE,
                JSON.stringify(products, null, 2) + '\n', // Formatear con espacios y agregar un salto de línea.
                'utf8'
            );

            return newProduct; // Retornar el producto creado.
        } catch (error) {
            console.error('Error creando el producto:', error);
            throw error; // Propagar el error para ser manejado externamente.
        }
    }

    /**
     * Obtiene todos los productos almacenados en el archivo `products.json`.
     * 
     * @returns {Array} Lista de productos (vacía si no hay productos o si ocurre un error).
     */
    static async getAllProducts() {
        try {
            // Leer el contenido del archivo de productos.
            const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
            if (!data || data.trim() === '') {
                // Si el archivo está vacío, retornar un arreglo vacío.
                console.warn('Archivo vacío. Retorna []');
                return [];
            }
            return JSON.parse(data); // Analizar y retornar los productos.
        } catch (error) {
            console.error('Error al obtener productos:', error.message);
            return []; // En caso de error, retornar un arreglo vacío.
        }
    }
}

// Exportar la clase ProductModel para que pueda ser usada en otros archivos.
module.exports = ProductModel;
