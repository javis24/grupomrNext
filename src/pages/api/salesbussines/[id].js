import { authenticateToken } from '../../../lib/auth';
import SalesBusiness from '../../../models/SalesBusinessModel';

export default async function handler(req, res) {
    const { id } = req.query;
    const { method } = req;

    return authenticateToken(req, res, async () => {
        const { id: loggedUserId, role } = req.user;

        try {
            const sale = await SalesBusiness.findByPk(id);
            if (!sale) return res.status(404).json({ message: "Venta no encontrada" });

            // --- VALIDACIÓN DE SEGURIDAD ---
            // Solo el dueño de la venta o un admin/gerente pueden modificar/eliminar
            if (sale.userId !== loggedUserId && role !== 'admin' && role !== 'gerencia') {
                return res.status(403).json({ message: "No tienes permiso para modificar esta venta" });
            }

            if (method === 'PUT') {
                // Aseguramos que el userId original no cambie por error en el req.body
                const updateData = { ...req.body };
                delete updateData.userId; 

                await sale.update(updateData);
                return res.status(200).json({ message: "Venta actualizada correctamente" });
            }

            if (method === 'DELETE') {
                await sale.destroy();
                return res.status(200).json({ message: "Venta eliminada correctamente" });
            }

            res.setHeader('Allow', ['PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);

        } catch (error) {
            console.error("ERROR EN API DINÁMICA SALES:", error);
            return res.status(500).json({ message: "Error interno", error: error.message });
        }
    });
}