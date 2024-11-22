  //src/controller/authcontroller
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  const UserModel = require('../models/userModel');
  const config = require('../../config');

  exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

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

  exports.login = async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

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

        // Excluir el campo de la contraseña del objeto de usuario
        const { password: _, ...userWithoutPassword } = user;
        res.json({ 
            token, 
            user: userWithoutPassword, 
            redirectUrl: user.role === 'admin' ? '/pages/adminDashboard.html' : '/pages/home.html'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};
