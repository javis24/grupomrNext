// src/pages/api/business-units/reports.js
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

            // Validación de campos obligatorios
            if (!unitName || !salesTotalMonth || !daysElapsed || !salesObjective || !daysRemaining) {
                return res.status(400).json({ message: "Campos obligatorios faltantes" });
            }

            try {
                const company = await Company.findOne({ where: { userId: req.user.id } });
                if (!company) {
                    return res.status(404).json({ message: "Compañía no encontrada para este usuario" });
                }

                const newReport = await BusinessUnit.create({
                    name: unitName,
                    description: description || null,
                    total: total || null,
                    salesTotalMonth,
                    daysElapsed,
                    dailyAvgSales: dailyAvgSales || null,
                    daysRemaining,
                    projectedSales: projectedSales || null,
                    lastYearSales: lastYearSales || null,
                    salesObjective,
                    differenceObjective: differenceObjective || null,
                    remainingSales: remainingSales || null,
                    remainingDailySales: remainingDailySales || null,
                    companyId: company.id,
                });

                res.status(201).json(newReport);
            } catch (error) {
                console.error('Error al crear reporte:', error);
                res.status(500).json({ message: 'Error al crear reporte' });
            }
        });
    } else if (req.method === 'GET') {
        authenticateToken(req, res, async () => {
            try {
                const reports = await BusinessUnit.findAll();
                res.status(200).json(reports);
            } catch (error) {
                console.error('Error obteniendo reportes:', error);
                res.status(500).json({ message: 'Error obteniendo reportes' });
            }
        });
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
