// src/pages/api/business-units/[id].js
import { authenticateToken } from '../../../lib/auth';
import BusinessUnit from '../../../models/BusinessUnitModel';

export default async function handler(req, res) {
  try {
    await authenticateToken(req, res, async () => {
      const { method } = req;
      const { id } = req.query;  // Obtener el id del parámetro de la URL

      switch (method) {
        case 'GET':
          await handleGetRequest(req, res, id);
          break;

        case 'PUT':
          await handlePutRequest(req, res, id);
          break;

        case 'DELETE':
          await handleDeleteRequest(req, res, id);
          break;

        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ message: `Method ${method} Not Allowed` });
      }
    });
  } catch (error) {
    console.error('Error en el handler de la API:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
}

// Manejo de la solicitud GET para obtener un reporte específico
async function handleGetRequest(req, res, id) {
  try {
    const report = await BusinessUnit.findByPk(id);

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error('Error obteniendo el reporte:', error);
    return res.status(500).json({ message: 'Error obteniendo el reporte' });
  }
}

// Manejo de la solicitud PUT para actualizar un reporte específico
async function handlePutRequest(req, res, id) {
  const {
    description, total, unitName, salesTotalMonth, daysElapsed,
    dailyAvgSales, daysRemaining, projectedSales, lastYearSales,
    salesObjective, differenceObjective, remainingSales, remainingDailySales,
  } = req.body;

  // Validación de campos obligatorios
  if (!unitName || !salesTotalMonth || !daysElapsed || !salesObjective || !daysRemaining) {
    return res.status(400).json({ message: "Campos obligatorios faltantes" });
  }

  try {
    const report = await BusinessUnit.findByPk(id);

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    // Actualizar el reporte con los nuevos datos
    report.name = unitName;
    report.description = description || report.description;
    report.total = total || report.total;
    report.salesTotalMonth = salesTotalMonth;
    report.daysElapsed = daysElapsed;
    report.dailyAvgSales = dailyAvgSales || report.dailyAvgSales;
    report.daysRemaining = daysRemaining;
    report.projectedSales = projectedSales || report.projectedSales;
    report.lastYearSales = lastYearSales || report.lastYearSales;
    report.salesObjective = salesObjective;
    report.differenceObjective = differenceObjective || report.differenceObjective;
    report.remainingSales = remainingSales || report.remainingSales;
    report.remainingDailySales = remainingDailySales || report.remainingDailySales;

    await report.save();

    return res.status(200).json({ message: 'Reporte actualizado con éxito', report });
  } catch (error) {
    console.error('Error actualizando el reporte:', error);
    return res.status(500).json({ message: 'Error actualizando el reporte' });
  }
}

// Manejo de la solicitud DELETE para eliminar un reporte específico
async function handleDeleteRequest(req, res, id) {
  try {
    const report = await BusinessUnit.findByPk(id);

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    await report.destroy();
    return res.status(200).json({ message: 'Reporte eliminado con éxito' });
  } catch (error) {
    console.error('Error eliminando el reporte:', error);
    return res.status(500).json({ message: 'Error eliminando el reporte' });
  }
}
