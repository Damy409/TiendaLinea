// src/middleware/authmiddleware

// Importa la librería 'jsonwebtoken' para trabajar con JWT
const jwt = require('jsonwebtoken');
// Importa la clave secreta para la verificación del JWT desde el archivo de configuración
const { JWT_SECRET } = require('../../config');

/**
 * Extrae el token del encabezado 'Authorization' de la solicitud.
 * Se espera que el encabezado tenga el formato: 'Bearer <token>'.
 * 
 * @param {Object} req - El objeto de solicitud de Express.
 * @returns {string|null} El token extraído o null si no se encuentra el token.
 */
const obtenerToken = (req) => {
    const cabeceraAutorizacion = req.headers['authorization'];
    // Devuelve el token si se encuentra, o null si no está presente.
    return cabeceraAutorizacion ? cabeceraAutorizacion.split(' ')[1] : null;
};

/**
 * Verifica la validez de un token utilizando el secreto.
 * La verificación se realiza de manera asincrónica y se resuelve con el resultado decodificado del token.
 * 
 * @param {string} token - El token JWT a verificar.
 * @param {string} secret - El secreto utilizado para verificar el token.
 * @returns {Promise<Object>} Promesa que se resuelve con el objeto decodificado del token.
 */
const verificarToken = (token, secret) => {
    return new Promise((resolve, reject) => {
        // Verifica el token con el secreto utilizando jwt.verify
        jwt.verify(token, secret, (error, decodificado) => {
            if (error) {
                // Si ocurre un error en la verificación, rechaza la promesa con el error.
                reject(error);
            }
            // Si el token es válido, resuelve la promesa con el token decodificado.
            resolve(decodificado);
        });
    });
};

/**
 * Middleware que autentica el token enviado en la solicitud.
 * Verifica que el token esté presente y sea válido. Si es válido, 
 * extrae la información del usuario (userId, email, role) y la agrega al objeto de solicitud (req.user).
 * 
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 * @param {Function} next - La función que pasa el control al siguiente middleware.
 * @returns {Object} Respuesta con un error si el token es inválido o no se encuentra.
 */
exports.authenticateToken = async (req, res, next) => {
    const token = obtenerToken(req);

    // Si no se proporciona un token, devuelve un error con código 401.
    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    try {
        // Verifica el token y obtiene los datos decodificados.
        const decodificado = await verificarToken(token, JWT_SECRET);
        
        // Asocia los datos decodificados del token al objeto de solicitud para su uso en siguientes middlewares o rutas.
        req.user = {
            userId: decodificado.userId,
            email: decodificado.email,
            role: decodificado.role
        };
        // Llama al siguiente middleware o ruta si la autenticación es exitosa.
        next();
    } catch (error) {
        // Si el token es inválido, devuelve un error con código 403.
        return res.status(403).json({ mensaje: 'Token inválido' });
    }
};

/**
 * Middleware que verifica si el usuario tiene el rol de 'admin'.
 * Si el usuario no es admin, devuelve un error con código 403.
 * 
 * @param {Object} req - El objeto de solicitud de Express.
 * @param {Object} res - El objeto de respuesta de Express.
 * @param {Function} next - La función que pasa el control al siguiente middleware.
 * @returns {Object} Respuesta con un error si el rol no es 'admin'.
 */
exports.isAdmin = (req, res, next) => {
    // Verifica que el rol del usuario sea 'admin'. Si no lo es, devuelve un error.
    if (req.user.role !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
    }
    // Si el usuario es admin, llama al siguiente middleware o ruta.
    next();
};
