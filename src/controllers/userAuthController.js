/**
 * UserAuthController - Controlador para manejar el registro e inicio de sesión de usuarios.
 * 
 * Este controlador utiliza JSON Web Tokens (JWT) para la autenticación y bcrypt para el manejo seguro de contraseñas.
 * Permite registrar nuevos usuarios e iniciar sesión con credenciales válidas.
 */

const jwt = require('jsonwebtoken'); // Para generar y verificar tokens JWT.
const bcrypt = require('bcryptjs'); // Para el hash y verificación de contraseñas.
const UserModel = require('../models/userModel'); // Modelo para interactuar con los datos de usuarios.
const config = require('../../config'); // Configuración global de la aplicación.

/**
 * register - Maneja el registro de nuevos usuarios.
 * 
 * Este método crea un nuevo usuario después de verificar que el correo electrónico no esté registrado.
 * Luego genera un token JWT para autenticar al usuario recién creado.
 * 
 * @param {Object} req - Objeto de solicitud de Express, con el cuerpo que contiene `email`, `password` y `role`.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body; // Extraer los datos del cuerpo de la solicitud.

        // Verificar si el usuario ya existe en el sistema.
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya se encuentra registrado' }); // Error si el email está en uso.
        }

        // Crear un nuevo usuario con la información proporcionada.
        const user = await UserModel.create({ email, password, role });

        // Generar un token JWT para autenticar al usuario.
        const token = jwt.sign(
            { 
                userId: user.id,  // ID único del usuario.
                email: user.email, // Email del usuario.
                role: user.role    // Rol del usuario (e.g., admin, cliente).
            },
            config.JWT_SECRET, // Secreto para firmar el token.
            { expiresIn: config.JWT_EXPIRES_IN } // Tiempo de expiración del token.
        );

        // Responder con el token y la información del usuario.
        res.status(201).json({ token, user });
    } catch (error) {
        console.error('Error registrando el usuario:', error);
        res.status(500).json({ message: 'Error registrando el usuario' }); // Error genérico para problemas del servidor.
    }
};

/**
 * login - Maneja el inicio de sesión de usuarios.
 * 
 * Este método verifica las credenciales de un usuario existente. Si son válidas, genera un token JWT.
 * 
 * @param {Object} req - Objeto de solicitud de Express, con el cuerpo que contiene `email` y `password`.
 * @param {Object} res - Objeto de respuesta de Express.
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body; // Extraer los datos de la solicitud.

        // Buscar el usuario por su email.
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Credencial inválida' }); // Error si no se encuentra el usuario.
        }

        // Comparar la contraseña proporcionada con el hash almacenado.
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credencial inválida' }); // Error si la contraseña no coincide.
        }

        // Generar un token JWT para el usuario autenticado.
        const token = jwt.sign(
            { 
                userId: user.id,  // ID único del usuario.
                email: user.email, // Email del usuario.
                role: user.role    // Rol del usuario.
            },
            config.JWT_SECRET, // Secreto para firmar el token.
            { expiresIn: config.JWT_EXPIRES_IN } // Tiempo de expiración del token.
        );

        // Excluir la contraseña del objeto de usuario antes de enviarlo al cliente.
        const { password: _, ...userWithoutPassword } = user;

        // Responder con el token y la información del usuario.
        res.json({ 
            token, 
            user: userWithoutPassword, 
            redirectUrl: user.role === 'admin' ? '/pages/adminDashboard.html' : '/pages/home.html' // Redirigir según el rol.
        });
    } catch (error) {
        console.error('Error iniciando sesión:', error);
        res.status(500).json({ message: 'Error iniciando sesión' }); // Error genérico para problemas del servidor.
    }
};
