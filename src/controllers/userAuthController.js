const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const config = require('../../config');

// Validar campos requeridos
function validateUserData(email, password, role) {
    if (!email || !password || !role) {
        return 'Todos los campos (email, contraseña, rol) son obligatorios.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'El email no tiene un formato válido.';
    }
    return null;
}

exports.registerUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validar datos de entrada
        const validationError = validateUserData(email, password, role);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // Verificar si el usuario ya existe
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Este email ya se encuentra registrado.' });
        }

        // Crear nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 10); // Encriptar contraseña
        const newUser = await UserModel.create({ email, password: hashedPassword, role });

        // Generar token
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email, 
                role: newUser.role 
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        // Excluir contraseña al devolver el usuario
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Se produjo un error al registrar el usuario.' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar datos de entrada
        if (!email || !password) {
            return res.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
        }

        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Las credenciales son inválidas.' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Las credenciales son inválidas.' });
        }

        // Generar token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                role: user.role 
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        // Excluir la contraseña del objeto usuario
        const { password: _, ...userWithoutPassword } = user;

        // Redirección según el rol del usuario
        const redirectUrl = user.role === 'admin' ? '/views/admin.html' : '/views/home.html';

        res.json({ 
            token, 
            user: userWithoutPassword, 
            redirectUrl 
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
};
