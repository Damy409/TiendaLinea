const path = require('path');
const ProductModel = require(path.join(__dirname, '../models/productsModel'));

exports.createProduct = async (req, res) => {
    try {
        const { name, price, image } = req.body;

        // Comprobación de los datos
        if (!name || !price || !image) {
            return res.status(400).json({ 
                message: 'Se requieren los campos: name, price e image.',
                receivedData: { name, price, image } 
            });
        }

        // Comprobación del precio
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ 
                message: 'El precio debe ser un número válido mayor que 0.' 
            });
        }

        // Crear el producto
        const product = await ProductModel.createProduct({ name, price, image });

        return res.status(201).json({ 
            message: 'Producto creado con éxito.',
            product 
        });
    } catch (err) {
        console.error('Error al crear el producto:', err);
        res.status(500).json({ 
            message: 'Hubo un error al crear el producto.',
            errorDetails: err.message 
        });
    }
};

// Obtener productos
exports.getProducts = async (req, res) => {
    try {
        const products = await ProductModel.getProducts();
        res.status(200).json(products);
    } catch (err) {
        console.error('Error al recuperar los productos:', err);
        res.status(500).json({
            message: 'Hubo un problema al obtener los productos.',
            errorDetails: err.message
        });
    }
};