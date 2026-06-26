import { authenticateToken } from '../../../lib/auth';
import Quotes from '../../../models/QuoteModel';

export default async function handler(req, res) {
    return authenticateToken(req, res, async () => {
        const { method } = req;
        const { id } = req.query;
        const { id: loggedUserId, role } = req.user;

        try {
            const quote = await Quotes.findByPk(id);

            if (!quote) {
                return res.status(404).json({
                    message: "Cotización no encontrada",
                });
            }

            /**
             * DELETE:
             * Todos los roles autenticados pueden eliminar cotizaciones.
             * Admin, gerencia y vendedor pueden eliminar.
             */
            if (method === 'DELETE') {
                await quote.destroy();

                return res.status(200).json({
                    message: "Cotización eliminada correctamente",
                });
            }

            /**
             * PUT:
             * Para actualizar, mantenemos seguridad:
             * solo dueño, admin o gerencia pueden editar.
             */
            const isOwner = quote.userId === loggedUserId;
            const isAdmin = role === 'admin' || role === 'gerencia';

            if (!isOwner && !isAdmin) {
                return res.status(403).json({
                    message: "No tienes permiso para realizar esta acción",
                });
            }

            if (method === 'PUT') {
                const {
                    companyName,
                    address,
                    attentionTo,
                    department,
                    email,
                    phone,
                    supervisor,
                    descripcionGeneral,
                    items,
                    observaciones,
                    total,
                    status,
                    includeProductImages,
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
                    items,
                    observaciones,
                    total,
                    status,
                    includeProductImages,
                });

                return res.status(200).json({
                    message: "Cotización actualizada correctamente",
                    quote,
                });
            }

            res.setHeader('Allow', ['PUT', 'DELETE']);

            return res.status(405).json({
                message: `Method ${method} not allowed`,
            });

        } catch (error) {
            console.error("API ID ERROR:", error);

            return res.status(500).json({
                message: "Error interno en cotización",
                error: error.message,
            });
        }
    });
}