import { authenticateToken } from '../../../lib/auth';
import Quotes from '../../../models/QuoteModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
    return authenticateToken(req, res, async () => {
        const { method } = req;
        const { id: loggedUserId, role } = req.user;

        try {
            if (method === 'GET') {
                const whereClause = (role === 'admin' || role === 'gerencia') ? {} : { userId: loggedUserId };
                const quotes = await Quotes.findAll({
                    where: whereClause,
                    include: [{ model: Users, as: 'assignedUser', attributes: ['name'] }],
                    order: [['createdAt', 'DESC']]
                });
                return res.status(200).json(quotes);
            }

            if (method === 'POST') {
                // RECIBIMOS LOS NUEVOS CAMPOS DEL BODY
                const { 
                    companyName, 
                    attentionTo, 
                    email, 
                    phone, 
                    total, 
                    quoteNumber,
                    address,          // <--- NUEVO
                    department,       // <--- NUEVO
                    supervisor,       // <--- NUEVO
                    descripcionGeneral, // <--- NUEVO
                    items,            // <--- NUEVO
                    observaciones     // <--- NUEVO
                } = req.body;

                const newQuote = await Quotes.create({
                    quoteNumber, 
                    companyName, 
                    address,          // Guardamos domicilio
                    attentionTo, 
                    department,       // Guardamos departamento
                    email, 
                    phone, 
                    supervisor,       // Guardamos asesor
                    descripcionGeneral, // Guardamos descripción larga
                    items,            // Sequelize hará el JSON.stringify automáticamente por el modelo
                    observaciones,    // Sequelize hará el JSON.stringify automáticamente por el modelo
                    total,
                    userId: loggedUserId
                });
                
                return res.status(201).json(newQuote);
            }

            // Opcional: Manejar otros métodos
            return res.status(405).json({ message: "Method not allowed" });

        } catch (error) {
            console.error("API ERROR:", error);
            return res.status(500).json({ message: error.message });
        }
    });
}