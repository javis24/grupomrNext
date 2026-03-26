import Users from '../../../models/UserModel';
import Clients from '../../../models/ClientModel';
import Prospects from '../../../models/ProspectModel';
import Sales from '../../../models/SalesModel'; 
import Appointments from '../../../models/AppointmentModel'; 
import { authenticateToken } from '../../../lib/auth';
import { Sequelize, Op } from 'sequelize';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    return new Promise((resolve) => {
        authenticateToken(req, res, async () => {
            try {
                // Solo Admin o Gerencia deberían ver este reporte global
                if (req.user.role === 'vendedor') {
                    res.status(403).json({ message: 'No tienes permisos para este reporte' });
                    return resolve();
                }

                // Traemos todos los asesores
                const users = await Users.findAll({
                    attributes: ['id', 'name', 'email'],
                    where: { role: 'vendedor' }
                });

                const report = await Promise.all(users.map(async (user) => {
                    
                    // 1. Estadísticas de Clientes (Último creado y total)
                    const clientStats = await Clients.findOne({
                        where: { userId: user.id },
                        attributes: [
                            [Sequelize.fn('MAX', Sequelize.col('createdAt')), 'lastClientDate'],
                            [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalClients']
                        ],
                        raw: true
                    });

                    // 2. Estadísticas de Prospectos (Conteo por proceso)
                    const prospectList = await Prospects.findAll({
                        where: { userId: user.id },
                        attributes: ['saleProcess', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
                        group: ['saleProcess'],
                        raw: true
                    });

                    const prospectsStats = {
                        inicial: prospectList.find(p => p.saleProcess === 'Contacto inicial')?.count || 0,
                        seguimiento: prospectList.find(p => p.saleProcess === 'Seguimiento')?.count || 0,
                        propuesta: prospectList.find(p => p.saleProcess === 'Propuesta enviada')?.count || 0,
                        cerrado: prospectList.find(p => p.saleProcess === 'Cerrado')?.count || 0,
                    };

                    // 3. Estadísticas de Citas (Próxima o última cita registrada)
                    const appointmentStats = await Appointments.findOne({
                        where: { userId: user.id },
                        attributes: [
                            [Sequelize.fn('MAX', Sequelize.col('date')), 'lastAppointmentDate']
                        ],
                        raw: true
                    });

                    // 4. Estadísticas de Ventas (Suma total de ventas y última fecha)
                    // Nota: Sales usa 'sale' para el monto y 'createdAt' para la fecha automática
                    const saleStats = await Sales.findOne({
                        where: { userId: user.id },
                        attributes: [
                            [Sequelize.fn('MAX', Sequelize.col('createdAt')), 'lastSaleDate'],
                            [Sequelize.fn('SUM', Sequelize.col('sale')), 'totalRevenue'],
                            [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalSalesCount']
                        ],
                        raw: true
                    });

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        // Datos de Clientes
                        lastClientDate: clientStats?.lastClientDate || null,
                        totalClients: clientStats?.totalClients || 0,
                        // Datos de Prospectos
                        prospectsStats,
                        // Datos de Ventas (Calculados de SalesModel)
                        lastSaleDate: saleStats?.lastSaleDate || null, 
                        totalSales: saleStats?.totalSalesCount || 0,
                        totalRevenue: saleStats?.totalRevenue || 0,
                        // Datos de Citas (Calculados de AppointmentsModel)
                        lastAppointmentDate: appointmentStats?.lastAppointmentDate || null
                    };
                }));

                res.status(200).json(report);
            } catch (error) {
                console.error("Error en reporte de actividad:", error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
            resolve();
        });
    });
}