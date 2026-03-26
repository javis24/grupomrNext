import Clients from '../../../models/ClientModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
    const { method, query } = req;

    // Forzamos a Next.js a esperar la resolución de la autenticación
    return new Promise((resolve) => {
        authenticateToken(req, res, async () => {
            // Verificamos que el usuario exista tras la autenticación
            if (!req.user) {
                res.status(401).json({ message: "Sesión inválida o expirada" });
                return resolve();
            }

            const { role: userRole, id: userId } = req.user;

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
                            // Si es vendedor, solo ve sus clientes
                            if (userRole === 'vendedor') {
                                whereClause.userId = userId;
                            }
                            // Filtro por planta (Unidad de Negocio)
                            if (planta) {
                                whereClause.planta = planta;
                            }

                            const response = await Clients.findAll({ where: whereClause });
                            res.status(200).json(response);
                        }
                        break;

                    case 'POST':
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
            // Importante: resolve() indica que la promesa terminó
            resolve();
        });
    });
}