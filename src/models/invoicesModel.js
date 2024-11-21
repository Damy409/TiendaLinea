const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const billsFile = path.join(dataDir, 'bills.json');

class Invoices {
    static async init() {
        try {
            await fs.mkdir(dataDir, { recursive: true });
            try {
                await fs.access(billsFile);
            } catch {
                await fs.writeFile(billsFile, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error en la configuración de BillModel:', error);
            throw error;
        }
    }

    static async createInvoice(userEmail, cartItems) {
        try {
            await this.setup();
            const currentData = await fs.readFile(billsFile, 'utf8');
            const invoices = JSON.parse(currentData);

            const newInvoice = {
                id: Date.now().toString(),
                userEmail,
                items: cartItems,
                total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
                date: new Date().toISOString()
            };

            invoices.push(newInvoice);
            await fs.writeFile(billsFile, JSON.stringify(invoices, null, 2), 'utf8');
            return newInvoice;
        } catch (error) {
            console.error('Error al crear la factura:', error);
            throw error;
        }
    }

    static async getInvoicesByUser(userEmail) {
        try {
            await this.setup();
            const currentData = await fs.readFile(billsFile, 'utf8');
            const invoices = JSON.parse(currentData);

            return invoices.filter(invoice => invoice.userEmail === userEmail);
        } catch (error) {
            console.error('Error al obtener las facturas:', error);
            throw error;
        }
    }
}

module.exports = Invoices;
