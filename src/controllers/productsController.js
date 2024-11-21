const path = require('path');
const ProductModel = require(path.join(__dirname, '../models/productsModel'));

exports.createProduct = async (req, res) => {
    try {
        const { name, price, image } = req.body;

        // Validación de datos
        if (!name || !price || !image) {
            return res.status(400).json({ 
                message: 'Todos los campos (name, price, image) son obligatorios.',
                received: { name, price, image } 
            });
        }

        // Validación del precio
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ 
                message: 'El precio debe ser un número válido mayor a 0.' 
            });
        }

        const product = await ProductModel.createNewProduct({ name, price, image });

        res.status(201).json({ 
            message: 'Producto creado exitosamente.',
            product 
        });
    } catch (error) {
        console.error('Error en createProduct:', error);
        res.status(500).json({ 
            message: 'Error al crear el producto.',
            error: error.message 
        });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await ProductModel.getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ 
            message: 'Error al obtener los productos.',
            error: error.message 
        });
    }
};
