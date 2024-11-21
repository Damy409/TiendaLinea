const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const config = require('../../config');

exports.registerUser = async (req, res) => {

  const { email, password, role } = req.body;
  try {

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Crear nuevo usuario
    const user = await UserModel.create({ email, password, role });

    // Generar token
    const token = jwt.sign(
        { 
            userId: user.id, 
            email: user.email, // Incluir explícitamente el email
            role: user.role 
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.status(201).json({ token, user });
} catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario' });
}
  };

  exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Validación de credenciales
      if (!email || !password) {
        return res.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
      }
  
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas.' });
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas.' });
      }
  
      // Crear token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );
  
      // Excluir contraseña del usuario
      const { password: _, ...userWithoutPassword } = user;
  
      // Redirigir según el rol
      const redirectUrl = user.role === 'adminDashboard' ? '/pages/adminDashboard.html' : '/pages/home.html';
  
      res.json({ token, user: userWithoutPassword, redirectUrl });
  
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
  };
