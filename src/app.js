// Importación de módulos necesarios
const express = require("express"); // Framework para crear servidores web
const cors = require("cors"); // Middleware para habilitar CORS (Cross-Origin Resource Sharing)
const path = require("path"); // Módulo nativo para manejar rutas de archivos
const userAuthRoutes = require("./routes/userAuthRoutes"); // Rutas para la autenticación de usuarios
const productsRoutes = require('./routes/productsRoutes'); // Rutas para gestionar productos
const shoppingCartRoutes = require('./routes/shoppingCartRoutes'); // Rutas para el carrito de compras
const invoicesRoutes = require('./routes/invoicesRoutes'); // Rutas para la gestión de facturas

// Creación de la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001; // Definición del puerto, con soporte para variables de entorno

// Configuración de middlewares
app.use(cors()); // Habilita CORS para permitir solicitudes desde otros dominios
app.use(express.json()); // Middleware para interpretar cuerpos de solicitudes en formato JSON

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, "../public"))); // Carpeta pública que contiene archivos estáticos como HTML, CSS y JS

// Configuración de rutas de la API
app.use("/api/auth", userAuthRoutes); // Ruta base para autenticación de usuarios
app.use('/api/products', productsRoutes); // Ruta base para productos
app.use('/api/cart', shoppingCartRoutes); // Ruta base para carrito de compras
app.use('/api/bills', invoicesRoutes); // Ruta base para facturas

// Rutas para servir vistas HTML
app.get(["/", "/adminDashboard", "/userLogin", "/register"], (req, res) => {
    // Determina qué archivo HTML servir basado en la ruta solicitada
    const pages = req.path === "/" ? "userLogin" : req.path.slice(1); 
    res.sendFile(path.join(__dirname, `../public/pages/${pages}.html`)); // Envía el archivo correspondiente al cliente
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack); // Muestra el error en la consola para depuración
    res.status(500).json({ 
        message: 'Ups ocurrio un error!', // Mensaje amigable para el usuario
        error: process.env.NODE_ENV === 'development' ? err.message : {} // Detalles solo en modo desarrollo
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`); // Mensaje informativo al iniciar el servidor
});
