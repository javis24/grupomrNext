import { authenticateToken } from '../../../lib/auth';
import SalesBusiness from '../../../models/SalesBusinessModel'; 
import Clients from '../../../models/ClientModel'; 
import Users from '../../../models/UserModel';
import { Sequelize, Op } from 'sequelize';

export default async function handler(req, res) {
    authenticateToken(req, res, async () => {
        const { role, id: loggedUserId } = req.user;
        const { range } = req.query;

        // --- 1. CONFIGURACIÓN DE FILTROS DE TIEMPO ---
        const now = new Date();
        let startDate;

        if (range === 'day') {
            startDate = new Date(now.setHours(0, 0, 0, 0));
        } else if (range === 'week') {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        const dateFilter = { createdAt: { [Op.gte]: startDate } };
        
        // Filtro de seguridad por rol
        const userFilter = role === 'admin' || role === 'gerencia' ? {} : { userId: loggedUserId };

        try {
         const salesByUser = await SalesBusiness.findAll({
                where: { ...dateFilter, ...userFilter },
                attributes: [
                    'userId',
                    [Sequelize.fn('SUM', Sequelize.col('total')), 'totalVendido'],
                    [Sequelize.fn('COUNT', Sequelize.col('SalesBusiness.id')), 'cantidadVentas']
                ],
                include: [{ 
                    model: Users, 
                    attributes: ['name']
                }],
                // CORRECCIÓN AQUÍ: 
                // Usamos el nombre del campo de la tabla principal y el ID del modelo incluido
                group: ['SalesBusiness.userId', 'user.id'], 
                raw: true,
                nest: true
            });

            // Formateamos para que el frontend reciba "userName" directamente
            const formattedSalesByUser = salesByUser.map(s => ({
                userId: s.userId,
                totalVendido: s.totalVendido,
                cantidadVentas: s.cantidadVentas,
                userName: s.user?.name || 'Asesor'
            }));

            // --- 3. DETALLE INDIVIDUAL DE CADA VENTA (Para los acordeones) ---
            const salesDetails = await SalesBusiness.findAll({
                where: { ...dateFilter, ...userFilter },
                include: [
                    { model: Clients, attributes: ['fullName'] },
                    { model: Users, attributes: ['name'] }
                ],
                order: [['createdAt', 'DESC']]
            });

            // --- 4. REPORTE DE CLIENTES NUEVOS ---
            const clientsReport = await Clients.findAll({
                where: { ...dateFilter, ...userFilter },
                attributes: [
                    'userId',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'clientesRegistrados']
                ],
                group: ['userId'],
                raw: true
            });

           // --- 5. RESPUESTA FINAL ---
            return res.status(200).json({ 
                salesByUser: formattedSalesByUser, 
                // Usamos s.get() para convertir el objeto de Sequelize a JSON puro
                salesDetails: salesDetails.map(s => {
                    const sale = s.get({ plain: true });
                    return {
                        id: sale.id,
                        userId: sale.userId,
                        fechaOperacion: sale.fechaOperacion,
                        // Verificamos el alias (puede ser 'client' o 'Client' según tu modelo)
                        clientName: sale.client?.fullName || sale.Client?.fullName || 'S/N',
                        unitBusiness: sale.unitBusiness,
                        concepto: sale.concepto,
                        total: sale.total
                    };
                }),
                clients: clientsReport 
            });

        } catch (error) {
            console.error("ERROR EN PERFORMANCE API:", error);
            // El return aquí evita que la función intente seguir ejecutándose
            return res.status(500).json({ message: "Error interno en el reporte", error: error.message });
        }
    });
}