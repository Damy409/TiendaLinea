const express = require("express");
const cors = require("cors");
const path = require("path");
const userAuthRoutes = require("./routes/userAuthRoutes");
const productsRoutes = require('./routes/productsRoutes');
const shoppingCartRoutes = require('./routes/shoppingCartRoutes');
// Añadir esta línea a las importaciones
const invoicesRoutes = require('./routes/invoicesRoutes');

// Añadir esta línea a las configuraciones de rutas

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// Configurar rutas de la API
app.use("/api/auth", userAuthRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', shoppingCartRoutes);

app.use('/api/bills', invoicesRoutes);

// ... otras rutas
// Ruta para manejar las vistas HTML
app.get(["/", "/adminDashboard", "/userLogin", "/register"], (req, res) => {
    const page = req.path === "/" ? "userLogin" : req.path.slice(1);
    res.sendFile(path.join(__dirname, `../public/pages/${page}.html`));
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Algo salió mal!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});