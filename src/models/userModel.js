// src/models/userModel.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../database');
const USERS_FILE = path.join(DATA_DIR, 'usersAccounts.json');

class UserModel {

  static async init() {
    try {
        // Asegurarse que el directorio data existe
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Asegurarse que el archivo users.json existe
        try {
            await fs.access(USERS_FILE);
        } catch {
            await fs.writeFile(USERS_FILE, '[]');
        }
    } catch (error) {
        console.error('Error initializing UserModel:', error);
    }
  }

  static async getAllUsers() {
      try {
          await this.init();
          const data = await fs.readFile(USERS_FILE, 'utf8');
          return JSON.parse(data || '[]');
      } catch (error) {
          console.error('Error getting users:', error);
          return [];
      }
  }

  static async findByEmail(email) {
    const users = await this.getAllUsers();
    return users.find(user => user.email === email);
  }

  static async create(userData) {
    try {
        const users = await this.getAllUsers();
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const newUser = {
            id: Date.now().toString(),
            email: userData.email,
            password: hashedPassword,
            role: userData.role || 'client',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        
        // Retornar usuario sin contraseña
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Error al crear usuario');
    }
  }
}
    
  module.exports = UserModel;