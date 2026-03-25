import CreditRequests from '../../../models/CreditRequestModel.js';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
    // Es mejor usar un bloque try-catch externo para manejar errores de autenticación
    try {
        await new Promise((resolve, reject) => {
            authenticateToken(req, res, async () => {
                const { method, body, user } = req;

                try {
                    if (method === 'GET') {
                        const requests = await CreditRequests.findAll({
                            where: user.role === 'admin' ? {} : { userId: user.id },
                            order: [['createdAt', 'DESC']]
                        });
                        res.status(200).json(requests);
                        return resolve();
                    }

                    if (method === 'POST') {
                        if (!body.nombreComercial || !body.rfc) {
                            res.status(400).json({ message: "Nombre y RFC obligatorios" });
                            return resolve();
                        }

                        // Aseguramos que fullData sea un string si Sequelize da problemas, 
                        // aunque con DataTypes.JSON debería funcionar.
                        const newRequest = await CreditRequests.create({
                            nombreComercial: body.nombreComercial,
                            rfc: body.rfc,
                            montoSolicitado: parseFloat(body.pagare?.buenoPor || 0),
                            fullData: body, 
                            userId: user.id
                        });

                        res.status(201).json(newRequest);
                        return resolve();
                    }

                    res.setHeader('Allow', ['GET', 'POST']);
                    res.status(405).end(`Method ${method} Not Allowed`);
                    return resolve();

                } catch (dbError) {
                    console.error("ERROR DE DB:", dbError);
                    res.status(500).json({ message: dbError.message });
                    return resolve(); // Resolvemos para que Next no se quede trabado
                }
            });
        });
    } catch (authError) {
        res.status(401).json({ message: "No autorizado" });
    }
}