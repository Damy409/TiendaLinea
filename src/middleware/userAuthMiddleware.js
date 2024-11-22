/**
 * Middleware de autenticación y autorización.
 * 
 * Este módulo contiene funciones middleware para manejar la autenticación
 * y la autorización utilizando JSON Web Tokens (JWT).
 */

const jwt = require('jsonwebtoken'); // Biblioteca para trabajar con JSON Web Tokens.
const config = require('../../config'); // Configuración global (incluye el secreto JWT).

/**
 * authenticateToken - Middleware para autenticar tokens JWT.
 * 
 * Este middleware verifica que el cliente haya proporcionado un token JWT válido
 * en los encabezados de la solicitud. Si el token es válido, se extrae la información
 * del usuario y se añade a `req.user` para que otros middleware o controladores puedan usarla.
 * 
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Encabezado de autorización.
    const token = authHeader && authHeader.split(' ')[1]; // Extraer el token del encabezado.

    if (!token) {
        // Si no se proporciona el token, responder con un error 401 (No autorizado).
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar el token con el secreto configurado.
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Si el token es inválido o expiró, responder con un error 403 (Prohibido).
            return res.status(403).json({ message: 'Token inválido' });
        }
        // Si el token es válido, agregar la información del usuario al objeto `req`.
        req.user = {
            userId: decoded.userId, // ID del usuario extraído del token.
            email: decoded.email,  // Correo electrónico del usuario.
            role: decoded.role     // Rol del usuario (e.g., admin, cliente).
        };
        next(); // Pasar al siguiente middleware o controlador.
    });
};

/**
 * isAdmin - Middleware para verificar si el usuario tiene rol de administrador.
 * 
 * Este middleware se utiliza después de `authenticateToken` para asegurarse de que el
 * usuario autenticado tiene los privilegios necesarios para realizar ciertas acciones.
 * 
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
exports.isAdmin = (req, res, next) => {
    // Verificar si el usuario autenticado tiene rol de 'admin'.
    if (req.user.role !== 'admin') {
        // Si no es administrador, responder con un error 403 (Prohibido).
        return res.status(403).json({ message: 'Acceso denegado' });
    }
    next(); // Pasar al siguiente middleware o controlador.
};
