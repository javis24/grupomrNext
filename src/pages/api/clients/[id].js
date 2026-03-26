import Clients from '../../../models/ClientModel.js';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
    const { id } = req.query;

    return new Promise((resolve) => {
        authenticateToken(req, res, async () => {
            const { method } = req;
            const { role: userRole, id: userId } = req.user;

            try {
                const client = await Clients.findByPk(id);
                if (!client) {
                    res.status(404).json({ message: 'Cliente no encontrado' });
                    return resolve();
                }

                // Validación de Dueño (Vendedores solo tocan lo suyo)
                if (userRole === 'vendedor' && client.userId !== userId) {
                    res.status(403).json({ message: 'No tienes permiso' });
                    return resolve();
                }

                if (method === 'PUT') {
                    await client.update(req.body);
                    res.status(200).json({ message: "Actualizado", client });
                } 
                else if (method === 'DELETE') {
                    await client.destroy();
                    res.status(200).json({ message: 'Eliminado' });
                } 
                else {
                    res.status(405).json({ message: "Método no permitido" });
                }
            } catch (error) {
                res.status(500).json({ message: 'Error interno' });
            }
            resolve();
        });
    });
}