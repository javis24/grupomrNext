import { authenticateToken } from '../../../lib/auth';
import MicrosipSales from '../../../models/MicrosipSalesModel';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    return authenticateToken(req, res, async () => {
        try {
            const { sales } = req.body;
            const { id: userId } = req.user;

            // Agregamos el userId a cada registro del Excel
            const salesWithUser = sales.map(s => ({ ...s, userId }));

            // Guardar todos los registros de un solo golpe (Bulk Create)
            await MicrosipSales.bulkCreate(salesWithUser);

            res.status(200).json({ message: "Importación exitosa" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al importar", details: error.message });
        }
    });
}