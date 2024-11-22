const path = require('path');
const ProductModel = require(path.join(__dirname, '../models/productsModel'));


exports.createProduct = async (req, res) => {
    try {
        const { name, price, image } = req.body;
        
        // Validación de datos
        if (!name || !price || !image) {
            console.log('Datos incompletos:', { name, price, image }); // Para debugging
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos',
                received: { name, price, image } 
            });
        }

        // Validar que el precio sea un número válido
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ 
                message: 'El precio debe ser un número válido mayor que 0' 
            });
        }

        console.log('Creando producto:', { name, price, image }); // Para debugging

        const product = await ProductModel.createProduct({ name, price, image });
        
        console.log('Producto creado:', product); // Para debugging

        res.status(201).json({ 
            message: 'Producto creado exitosamente',
            product 
        });
    } catch (error) {
        console.error('Error en createProduct:', error);
        res.status(500).json({ 
            message: 'Error al crear producto',
            error: error.message 
        });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.getAllProducts();
        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ 
            message: 'Error al obtener productos',
            error: error.message 
        });
    }
};