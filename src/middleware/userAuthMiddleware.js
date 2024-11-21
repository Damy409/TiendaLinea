//src/middleware/authmiddleware
const jwt = require('jsonwebtoken');
const config = require('../../config');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        // Asegúrate de incluir el email en el token al iniciar sesión
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        next();
    });
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
};