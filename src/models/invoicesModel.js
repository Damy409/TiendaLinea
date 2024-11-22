const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../database');
const BILLS_FILE = path.join(DATA_DIR, 'invoicesData.json');

class BillModel {

    static async init() {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            try {
                await fs.access(BILLS_FILE);
            } catch {
                await fs.writeFile(BILLS_FILE, '[]', 'utf8');
            }
        } catch (error) {
            console.error('Error inicializando BillModel:', error);
            throw error;
        }
    }

    static async createBill(userEmail, items) {
        try {
            await this.init();
            const data = await fs.readFile(BILLS_FILE, 'utf8');
            const bills = JSON.parse(data);

            const newBill = {
                id: Date.now().toString(),
                userEmail,
                items,
                total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                date: new Date().toISOString()
            };

            bills.push(newBill);

            await fs.writeFile(BILLS_FILE, JSON.stringify(bills, null, 2), 'utf8');
            return newBill;
        } catch (error) {
            console.error('Error al crear factura:', error);
            throw error;
        }
    }

    static async getBillsByUser(userEmail) {
        try {
            await this.init();
            const data = await fs.readFile(BILLS_FILE, 'utf8');
            const bills = JSON.parse(data);

            return bills.filter(bill => bill.userEmail === userEmail);
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            throw error;
        }
    }
}

module.exports = BillModel;
