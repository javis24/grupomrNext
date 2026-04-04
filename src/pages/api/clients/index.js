import Clients from '../../../models/ClientModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
    const { method, query } = req;

    return new Promise((resolve) => {
        authenticateToken(req, res, async () => {
            if (!req.user) {
                res.status(401).json({ message: "Sesión inválida o expirada" });
                return resolve();
            }

            const { id: userId } = req.user;

            try {
                switch (method) {
                    case 'GET':
                        const { summary, latest, planta } = query;

                        if (summary === 'true') {
                            const totalClients = await Clients.count();
                            res.status(200).json({ totalClients });
                        } 
                        else if (latest === 'true') {
                            const latestClients = await Clients.findAll({
                                order: [['createdAt', 'DESC']],
                                limit: 5,
                                attributes: ['fullName', 'email', 'planta'],
                            });
                            res.status(200).json(latestClients);
                        } 
                        else {
                            let whereClause = {};
                            
                            // Ajuste: Eliminamos la restricción por userRole. 
                            // Ahora todos pueden ver todos los clientes.

                            // Mantenemos el filtro por planta si se requiere desde el frontend
                            if (planta) {
                                whereClause.planta = planta;
                            }

                            const response = await Clients.findAll({ 
                                where: whereClause,
                                order: [['fullName', 'ASC']] // Ordenamos alfabéticamente para mejor vista global
                            });
                            res.status(200).json(response);
                        }
                        break;

                    case 'POST':
                        // Al crear, seguimos vinculando quién lo registró originalmente
                        const newClient = await Clients.create({ ...req.body, userId });
                        res.status(201).json(newClient);
                        break;

                    default:
                        res.setHeader('Allow', ['GET', 'POST']);
                        res.status(405).json({ message: `Método ${method} no permitido` });
                        break;
                }
            } catch (error) {
                console.error("Database Error:", error);
                res.status(500).json({ message: "Error interno del servidor", details: error.message });
            }
            resolve();
        });
    });
}