// src/models/userModel.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIRECTORY = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIRECTORY, 'users.json');

class UserModel {
    // Inicializa el directorio y archivo de usuarios si no existen
    static async init() {
        try {
            // Asegurarse que el directorio data existe
            await fs.mkdir(DATA_DIRECTORY, { recursive: true });
            
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

    // Obtiene todos los usuarios
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

    // Busca un usuario por correo electrónico
    static async findByEmail(email) {
        const users = await this.getAllUsers();
        return users.find(user => user.email === email);
    }

    // Crea un nuevo usuario y lo guarda en el archivo
    static async create(userData) {
        try {
            const users = await this.getAllUsers();
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            // Crear un nuevo usuario con la contraseña hasheada
            const newUser = {
                id: Date.now().toString(),
                email: userData.email,
                password: hashedPassword,
                role: userData.role || 'client',
                createdAt: new Date().toISOString()
            };

            // Agregar el nuevo usuario al array
            users.push(newUser);
            await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
            
            // Retornar el usuario sin la contraseña
            const { password, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error al crear un usuario:', error);
            throw new Error('Error al crear un usuario');
        }
    }
}

module.exports = UserModel;
