const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const config = require('../../config');

const validateUserData = (email, password, role) => {
    if (!email || !password || !role) {
      return 'Todos los campos (email, contraseña, rol) son obligatorios.';
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'El email no tiene un formato válido.';
    }
  
    return null;
  };

  exports.registerUser = async (req, res) => {
    const { email, password, role } = req.body;
  
    try {
      // Validación de datos
      const errorMessage = validateUserData(email, password, role);
      if (errorMessage) {
        return res.status(400).json({ message: errorMessage });
      }
  
      // Verificar existencia de usuario
      const user = await UserModel.findByEmail(email);
      if (user) {
        return res.status(400).json({ message: 'Este email ya se encuentra registrado.' });
      }
  
      // Crear y encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await UserModel.create({ email, password: hashedPassword, role });
  
      // Crear token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );
  
      // Excluir la contraseña del objeto usuario
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ token, user: userWithoutPassword });
  
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ message: 'Hubo un error al registrar el usuario.' });
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
      const redirectUrl = user.role === 'admin' ? '/views/admin.html' : '/views/home.html';
  
      res.json({ token, user: userWithoutPassword, redirectUrl });
  
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
  };
