import { authenticateToken } from '../../../lib/auth';
import BusinessUnit from '../../../models/BusinessUnitModel';
import Company from '../../../models/CompanyModel';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        authenticateToken(req, res, async () => {
            const {
                description, total, unitName, salesTotalMonth, daysElapsed,
                dailyAvgSales, daysRemaining, projectedSales, lastYearSales,
                salesObjective, differenceObjective, remainingSales, remainingDailySales
            } = req.body;

            if (!description || !total || !unitName) {
                return res.status(400).json({ message: "Todos los campos son necesarios" });
            }

            try {
                const company = await Company.findOne({ where: { userId: req.user.id } });
                if (!company) {
                    return res.status(404).json({ message: "Compañía no encontrada para este usuario" });
                }

                const newReport = await BusinessUnit.create({
                    name: unitName,
                    description,
                    total,
                    salesTotalMonth,
                    daysElapsed,
                    dailyAvgSales,
                    daysRemaining,
                    projectedSales,
                    lastYearSales,
                    salesObjective,
                    differenceObjective,
                    remainingSales,
                    remainingDailySales,
                    companyId: company.id,
                });

                res.status(201).json(newReport);
            } catch (error) {
                console.error('Error al crear reporte:', error);
                res.status(500).json({ message: 'Error al crear reporte' });
            }
        });
    } 
    else if (req.method === 'GET') {
        authenticateToken(req, res, async () => {
            try {
                // Busca todos los reportes en la base de datos
                const reports = await BusinessUnit.findAll();
                res.status(200).json(reports);
            } catch (error) {
                console.error('Error fetching reports:', error);
                res.status(500).json({ message: 'Error fetching reports' });
            }
        });
    } 
    else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
