/**
 * BillModel - Clase para gestionar las facturas.
 * 
 * Este modelo permite crear y consultar facturas almacenadas en un archivo JSON,
 * simulando un sistema de persistencia de datos.
 * 
 * Métodos principales:
 * - `init`: Inicializa el sistema de almacenamiento.
 * - `createBill`: Crea y guarda una nueva factura.
 * - `getBillsByUser`: Obtiene las facturas de un usuario específico.
 */

const { promises: fs } = require('fs'); // Módulo fs para manejar archivos con Promesas.
const path = require('path'); // Módulo path para manejar rutas de archivos.

// Directorio y archivo de datos para almacenar facturas.
const DATA_DIR = path.join(__dirname, '../database'); // Carpeta donde se guardan los datos.
const BILLS_FILE = path.join(DATA_DIR, 'invoicesData.json'); // Archivo JSON de facturas.

class BillModel {
    /**
     * Inicializa la estructura de almacenamiento.
     * - Crea el directorio para las facturas si no existe.
     * - Asegura que el archivo `invoicesData.json` exista y contenga un arreglo vacío.
     */
    static async init() {
        try {
            // Crear el directorio si no existe.
            await fs.mkdir(DATA_DIR, { recursive: true });

            try {
                // Verificar si el archivo de facturas existe.
                await fs.access(BILLS_FILE);
            } catch {
                // Crear un archivo vacío si no existe.
                await fs.writeFile(BILLS_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando BillModel:', error);
            throw error; // Propagar el error para manejo externo.
        }
    }

    /**
     * Crea una nueva factura y la almacena en el archivo `invoicesData.json`.
     * 
     * @param {string} userEmail - Correo electrónico del usuario asociado con la factura.
     * @param {Array} items - Lista de objetos que representan los artículos comprados.
     *   Cada objeto debe tener las propiedades:
     *     - `price` (número): Precio del artículo.
     *     - `quantity` (número): Cantidad comprada.
     * @returns {Object} La factura creada, incluyendo un ID único, total y fecha.
     * @throws Lanza un error si ocurre un problema al guardar la factura.
     */
    static async createBill(userEmail, items) {
        try {
            await this.init(); // Asegurar que la estructura está lista.

            // Leer el archivo de facturas.
            const data = await fs.readFile(BILLS_FILE, 'utf8');
            const bills = JSON.parse(data); // Analizar datos existentes.

            // Crear una nueva factura con un ID único y cálculo del total.
            const newBill = {
                id: Date.now().toString(), // Generar un ID basado en la marca de tiempo actual.
                userEmail, // Usuario asociado a la factura.
                items, // Lista de artículos comprados.
                total: items.reduce((sum, item) => sum + item.price * item.quantity, 0), // Calcular el total.
                date: new Date().toISOString() // Registrar la fecha de creación.
            };

            bills.push(newBill); // Agregar la nueva factura al arreglo existente.

            // Guardar la lista actualizada de facturas en el archivo JSON.
            await fs.writeFile(BILLS_FILE, JSON.stringify(bills, null, 2), 'utf8');

            return newBill; // Retornar la factura creada.
        } catch (error) {
            console.error('Error para crear la factura:', error);
            throw error; // Propagar el error para manejo externo.
        }
    }

    /**
     * Obtiene todas las facturas asociadas a un usuario específico.
     * 
     * @param {string} userEmail - Correo electrónico del usuario cuyas facturas se quieren obtener.
     * @returns {Array} Lista de facturas asociadas al usuario.
     * @throws Lanza un error si ocurre un problema al leer las facturas.
     */
    static async getBillsByUser(userEmail) {
        try {
            await this.init(); // Asegurar que la estructura está lista.

            // Leer el archivo de facturas.
            const data = await fs.readFile(BILLS_FILE, 'utf8');
            const bills = JSON.parse(data); // Analizar datos existentes.

            // Filtrar facturas que coincidan con el correo electrónico del usuario.
            return bills.filter(bill => bill.userEmail === userEmail);
        } catch (error) {
            console.error('Error obteniendo facturas:', error);
            throw error; // Propagar el error para manejo externo.
        }
    }
}

// Exportar la clase para que pueda ser utilizada en otros módulos.
module.exports = BillModel;
