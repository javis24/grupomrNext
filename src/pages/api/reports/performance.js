import { authenticateToken } from '../../../lib/auth';
import Sales from '../../../models/SalesModel'; 
import Clients from '../../../models/ClientModel'; 
import Users from '../../../models/UserModel';
import { Sequelize, Op } from 'sequelize';

export default async function handler(req, res) {
    authenticateToken(req, res, async () => {
        const { role, id: loggedUserId } = req.user;
        const { range } = req.query;

        // Filtro de fecha para Clientes (basado en createdAt)
        let clientDateFilter = {};
        const now = new Date();
        if (range === 'day') {
            clientDateFilter = { createdAt: { [Op.gte]: new Date(now.setHours(0,0,0,0)) } };
        } else if (range === 'week') {
            const lastWeek = new Date(now.setDate(now.getDate() - 7));
            clientDateFilter = { createdAt: { [Op.gte]: lastWeek } };
        } else {
            const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
            clientDateFilter = { createdAt: { [Op.gte]: lastMonth } };
        }
// ... imports
try {
    const salesReport = await Sales.findAll({
        where: role === 'admin' ? {} : { userId: loggedUserId },
        attributes: [
            'userId',
            // Usamos el nombre del modelo 'Sales' tal cual está en el define
            [Sequelize.fn('SUM', Sequelize.col('Sales.sale')), 'totalVendido'],
            [Sequelize.fn('COUNT', Sequelize.col('Sales.id')), 'cantidadVentas']
        ],
        include: [{ 
            model: Users, 
            attributes: ['name']
        }],
        // Agrupamos usando la referencia exacta que Sequelize genera para el JOIN
        group: ['Sales.userId', 'user.id'], 
        raw: true, // Esto ayuda a que el resultado sea más fácil de procesar
        nest: true
    });

    const clientsReport = await Clients.findAll({
        where: role === 'admin' ? clientDateFilter : { ...clientDateFilter, userId: loggedUserId },
        attributes: [
            'userId',
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'clientesRegistrados']
        ],
        group: ['userId'],
        raw: true
    });

    res.status(200).json({ sales: salesReport, clients: clientsReport });
} catch (error) {
    console.error("ERROR REAL:", error);
    res.status(500).json({ message: error.message });
}
    });
}