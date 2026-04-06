import { authenticateToken } from '../../../lib/auth';
import AccountsReceivable from '../../../models/AccountsReceivableModel'; // Define tu modelo basándote en el SQL de arriba

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    return authenticateToken(req, res, async () => {
        try {
            const { items } = req.body;

            // REGLA DE ORO: Borramos todo lo anterior para que la actualización sea limpia
            await AccountsReceivable.destroy({ where: {}, truncate: true });

            // Insertamos los nuevos datos del Excel
            await AccountsReceivable.bulkCreate(items);

            res.status(200).json({ message: "Cartera actualizada con éxito" });
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar", error: error.message });
        }
    });
}