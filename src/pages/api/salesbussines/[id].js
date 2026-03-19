import { authenticateToken } from '../../../lib/auth';
import SalesBusiness from '../../../models/SalesBusinessModel';

export default async function handler(req, res) {
    const { id } = req.query;
    authenticateToken(req, res, async () => {
        try {
            const sale = await SalesBusiness.findByPk(id);
            if (!sale) return res.status(404).json({ message: "Venta no encontrada" });

            if (req.method === 'PUT') {
                await sale.update(req.body);
                return res.status(200).json({ message: "Actualizado correctamente" });
            }

            if (req.method === 'DELETE') {
                await sale.destroy();
                return res.status(200).json({ message: "Eliminado correctamente" });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
}