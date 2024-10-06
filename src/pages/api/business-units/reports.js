import { authenticateToken } from '../../../lib/auth';
import BusinessUnit from '../../../models/BusinessUnitModel';
import Company from '../../../models/CompanyModel';

export default async function handler(req, res) {
    authenticateToken(req, res, async () => {
        const { method } = req;
        
        switch (method) {
            case 'POST':
                await handlePostRequest(req, res);
                break;
            case 'GET':
                await handleGetRequest(req, res);
                break;
            default:
                res.setHeader('Allow', ['POST', 'GET']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    });
}

// Manejo de la solicitud POST para crear un reporte
async function handlePostRequest(req, res) {
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

        return res.status(201).json(newReport);
    } catch (error) {
        console.error('Error al crear reporte:', error);
        return res.status(500).json({ message: 'Error al crear reporte' });
    }
}

// Manejo de la solicitud GET para obtener los reportes
async function handleGetRequest(req, res) {
    try {
        const reports = await BusinessUnit.findAll();
        if (!reports || reports.length === 0) {
            return res.status(200).json([]); // Devolver un array vacío si no hay reportes
        }
        return res.status(200).json(reports);
    } catch (error) {
        console.error('Error obteniendo reportes:', error);
        return res.status(500).json({ message: 'Error obteniendo reportes' });
    }
}
