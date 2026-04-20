import { authenticateToken } from '../../../lib/auth';
import Quotes from '../../../models/QuoteModel';

export default async function handler(req, res) {
    return authenticateToken(req, res, async () => {
        const { method } = req;
        const { id } = req.query; // ID de la cotización desde la URL
        const { id: loggedUserId, role } = req.user;

        try {
            // 1. Buscar la cotización primero para verificar pertenencia
            const quote = await Quotes.findByPk(id);

            if (!quote) {
                return res.status(404).json({ message: "Cotización no encontrada" });
            }

            // 2. Verificación de permisos: Solo el dueño o admin/gerencia pueden operar
            const isOwner = quote.userId === loggedUserId;
            const isAdmin = role === 'admin' || role === 'gerencia';

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ message: "No tienes permiso para realizar esta acción" });
            }

            // --- MÉTODO ACTUALIZAR (PUT) ---
            if (method === 'PUT') {
                const { 
                    companyName, address, attentionTo, department, 
                    email, phone, supervisor, descripcionGeneral, 
                    items, observaciones, total, status 
                } = req.body;

                await quote.update({
                    companyName,
                    address,
                    attentionTo,
                    department,
                    email,
                    phone,
                    supervisor,
                    descripcionGeneral,
                    items, // Sequelize lo serializa solo por el modelo
                    observaciones, // Sequelize lo serializa solo por el modelo
                    total,
                    status
                });

                return res.status(200).json({ message: "Cotización actualizada correctamente", quote });
            }

            // --- MÉTODO ELIMINAR (DELETE) ---
            if (method === 'DELETE') {
                await quote.destroy();
                return res.status(200).json({ message: "Cotización eliminada correctamente" });
            }

            // Si el método no es PUT ni DELETE
            return res.status(405).json({ message: `Method ${method} not allowed` });

        } catch (error) {
            console.error("API ID ERROR:", error);
            return res.status(500).json({ message: error.message });
        }
    });
}