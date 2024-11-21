const fs = require('fs').promises;
const path = require('path');

const DATA_DIRECTORY = path.join(__dirname, '../data');
const INVOICES_FILE = path.join(DATA_DIRECTORY, 'bills.json');

class invoicesModel {
    static async init() {
        try {
            await fs.mkdir(DATA_DIRECTORY, { recursive: true });
            try {
                await fs.access(INVOICES_FILE);
            } catch {
                await fs.writeFile(INVOICES_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando BillModel:', error);
            throw error;
        }
    }

    static async createInvoice(emailU, shoppingCartItems) {
        try {
            await this.init();
            const database = await fs.readFile(INVOICES_FILE, 'utf8');
            const invoices = JSON.parse(database);

            const newInvoice = {
                id: Date.now().toString(),
                userEmail: emailU, // Corrección del nombre de la variable
                items: shoppingCartItems, // Corrección del nombre de la variable
                total: shoppingCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
                date: new Date().toISOString()
            };

            invoices.push(newInvoice);

            await fs.writeFile(INVOICES_FILE, JSON.stringify(invoices, null, 2), 'utf8');
            return newInvoice;
        } catch (error) {
            console.error('Error al crear factura:', error);
            throw error;
        }
    }

    static async getInvoicesByUser(emailU) {
        try {
            await this.init();
            const database = await fs.readFile(INVOICES_FILE, 'utf8');
            const invoices = JSON.parse(database);

            return invoices.filter(bill => bill.userEmail === emailU); // Corrección del nombre de la variable
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            throw error;
        }
    }
}

module.exports = invoicesModel;
