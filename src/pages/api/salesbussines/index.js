import { authenticateToken } from '../../../lib/auth';
import SalesBusiness from '../../../models/SalesBusinessModel';
import Clients from '../../../models/ClientModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
    authenticateToken(req, res, async () => {
        const { method } = req;
        const { id: loggedUserId, role } = req.user;

        try {
            switch (method) {
                case 'GET':
                    const queryOptions = {
                        include: [
                            { model: Clients, attributes: ['fullName', 'companyName'] },
                            { model: Users, attributes: ['name'] }
                        ],
                        order: [['createdAt', 'DESC']]
                    };
                    if (role !== 'admin' && role !== 'gerencia') {
                        queryOptions.where = { userId: loggedUserId };
                    }
                    const sales = await SalesBusiness.findAll(queryOptions);
                    return res.status(200).json(sales); // Siempre retorna 200 con data

                case 'POST':
                    const { 
                        unitBusiness, concepto, equipo, cantidad, 
                        precioUnitario, transporte, estadoPago, 
                        fechaOperacion, observaciones, clientId 
                    } = req.body;

                    // Validación de backend
                    if(!unitBusiness || !concepto || !cantidad || !precioUnitario || !clientId) {
                        return res.status(400).json({ message: "Faltan campos obligatorios" });
                    }

                    const newSale = await SalesBusiness.create({
                        unitBusiness,
                        concepto,
                        equipo: equipo || null,
                        cantidad: parseFloat(cantidad),
                        precioUnitario: parseFloat(precioUnitario),
                        transporte,
                        estadoPago,
                        fechaOperacion,
                        observaciones,
                        clientId,
                        userId: loggedUserId
                    });

                    return res.status(201).json({ message: "Venta registrada con éxito", data: newSale });

                default:
                    res.setHeader('Allow', ['GET', 'POST']);
                    return res.status(405).end(`Method ${method} Not Allowed`);
            }
        } catch (error) {
            console.error("ERROR EN API SALESBUSSINES:", error);
            return res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    });
}