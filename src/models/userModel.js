// src/models/userModel.js

// Importar módulos necesarios
const { promises: fs } = require('fs'); // Promesas de sistema de archivos para lectura y escritura
const path = require('path'); // Módulo para manipulación de rutas de archivos
const bcrypt = require('bcryptjs'); // Biblioteca para encriptación de contraseñas

// Definir constantes para directorios y archivos
const DATA_DIR = path.join(__dirname, '../database'); // Directorio donde se almacenan los datos
const USERS_FILE = path.join(DATA_DIR, 'usersAccounts.json'); // Archivo JSON para almacenar usuarios

// Definición del modelo UserModel
class UserModel {

  /**
   * Método de inicialización
   * Crea el directorio y el archivo necesario para almacenar datos de usuarios si no existen.
   */
  static async init() {
    try {
        // Asegura que el directorio de datos existe
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Asegura que el archivo `usersAccounts.json` existe
        try {
            await fs.access(USERS_FILE); // Verifica acceso al archivo
        } catch {
            await fs.writeFile(USERS_FILE, '[]'); // Crea el archivo con un array vacío si no existe
        }
    } catch (error) {
        console.error('Error inicializando UserModel:', error); // Loguea errores en la consola
    }
  }

  /**
   * Obtiene todos los usuarios del archivo
   * @returns {Promise<Array>} Lista de usuarios
   */
  static async getAllUsers() {
      try {
          await this.init(); // Asegura que el entorno está inicializado
          const data = await fs.readFile(USERS_FILE, 'utf8'); // Lee el contenido del archivo
          return JSON.parse(data || '[]'); // Parsea el contenido o retorna un array vacío
      } catch (error) {
          console.error('Error buscando usuarios:', error);
          return []; // En caso de error, retorna un array vacío
      }
  }

  /**
   * Busca un usuario por email
   * @param {string} email - Email del usuario a buscar
   * @returns {Promise<Object|null>} Usuario encontrado o null si no existe
   */
  static async findByEmail(email) {
    const users = await this.getAllUsers(); // Obtiene la lista de usuarios
    return users.find(user => user.email === email); // Retorna el usuario que coincida con el email
  }

  /**
   * Crea un nuevo usuario y lo almacena
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise<Object>} Usuario creado (sin la contraseña)
   */
  static async create(userData) {
    try {
        const users = await this.getAllUsers(); // Obtiene la lista de usuarios actuales
        const hashedPassword = await bcrypt.hash(userData.password, 10); // Hashea la contraseña
        
        // Define el nuevo usuario con los datos proporcionados
        const newUser = {
            id: Date.now().toString(), // ID único basado en la fecha actual
            email: userData.email, // Email del usuario
            password: hashedPassword, // Contraseña encriptada
            role: userData.role || 'client', // Rol del usuario (por defecto 'client')
            createdAt: new Date().toISOString() // Fecha de creación en formato ISO
        };

        users.push(newUser); // Agrega el nuevo usuario a la lista
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2)); // Guarda la lista actualizada en el archivo
        
        // Retorna el usuario sin incluir la contraseña
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    } catch (error) {
        console.error('Error al crear usuario:', error); // Loguea errores en la consola
        throw new Error('Error al crear usuario'); // Lanza un error para manejo externo
    }
  }
}

// Exporta el modelo para ser usado en otras partes de la aplicación
module.exports = UserModel;
