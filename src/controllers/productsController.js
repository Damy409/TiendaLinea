/**
 * ProductController - Controlador para gestionar productos.
 * 
 * Este controlador incluye funcionalidades para crear productos y obtener la lista de productos
 * almacenados en el sistema. Utiliza un modelo para manejar la persistencia de datos.
 */

const path = require('path'); // Módulo para manejar rutas de archivos.
const ProductModel = require(path.join(__dirname, '../models/productsModel')); // Modelo de productos.

/**
 * createProduct - Crea un nuevo producto y lo almacena.
 * 
 * Este método valida los datos proporcionados por el cliente antes de crear un nuevo producto.
 * Si los datos son válidos, utiliza el modelo de productos para guardarlo en la base de datos o archivo.
 * 
 * @param {Object} req - Objeto de solicitud de Express, con los datos del producto en `req.body`.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.createProduct = async (req, res) => {
    try {
        const { name, price, image } = req.body; // Extraer datos del cuerpo de la solicitud.

        // Validación de datos requeridos.
        if (!name || !price || !image) {
            console.log('Datos incompletos:', { name, price, image }); // Registro para debugging.
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos', // Respuesta de error si faltan datos.
                received: { name, price, image } // Enviar los datos recibidos como ayuda al cliente.
            });
        }

        // Validar que el precio sea un número válido mayor que 0.
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ 
                message: 'El precio debe ser un número válido' 
            });
        }

        console.log('Creando producto:', { name, price, image }); // Registro para debugging.

        // Crear el producto utilizando el modelo.
        const product = await ProductModel.createProduct({ name, price, image });
        
        console.log('Producto creado:', product); // Registro para debugging.

        // Responder con el producto creado.
        res.status(201).json({ 
            message: 'Producto creado exitosamente',
            product 
        });
    } catch (error) {
        console.error('Error :', error); // Registro de error.
        res.status(500).json({ 
            message: 'Error creando el producto', // Respuesta de error genérica.
            error: error.message // Incluir mensaje del error para debugging.
        });
    }
};

/**
 * getAllProducts - Obtiene todos los productos almacenados.
 * 
 * Este método utiliza el modelo de productos para recuperar todos los productos almacenados
 * y los envía como respuesta al cliente.
 * 
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.getAllProducts = async (req, res) => {
    try {
        // Obtener la lista de productos desde el modelo.
        const products = await ProductModel.getAllProducts();
        res.json(products); // Enviar productos como respuesta.
    } catch (error) {
        console.error('Error obteniendo productos:', error); // Registro de error.
        res.status(500).json({ 
            message: 'Error obteniendo productos', // Respuesta de error genérica.
            error: error.message // Incluir mensaje del error para debugging.
        });
    }
};
