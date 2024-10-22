import SalesReport from '../../../models/SalesReportModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    const { role: userRole, id: userId } = req.user;  // Obtener el rol y el ID del usuario autenticado

    switch (method) {
      case 'GET': {
        try {
          let reports;
          if (userRole === 'vendedor') {
            // Si el usuario es vendedor, solo puede ver los reportes que él creó
            reports = await SalesReport.findAll({ where: { userId } });
          } else {
            // Si el usuario es admin o gerencia, puede ver todos los reportes
            reports = await SalesReport.findAll();
          }

          if (!reports || reports.length === 0) {
            return res.status(200).json([]);  // Devolver array vacío si no hay reportes
          }

          return res.status(200).json(reports);
        } catch (error) {
          console.error('Error fetching reports:', error);
          return res.status(500).json({ message: 'Error fetching reports' });
        }
      }

      case 'POST': {
        const { clienteProveedorProspecto, empresa, unidadNegocio, productoServicio, comentarios, status } = req.body;

        if (!clienteProveedorProspecto || !empresa || !unidadNegocio || !productoServicio || !status) {
          return res.status(400).json({ message: 'Required fields are missing' });
        }

        try {
          const newReport = await SalesReport.create({
            clienteProveedorProspecto,
            empresa,
            unidadNegocio,
            productoServicio,
            comentarios,
            status,
            userId,  // Asociar el reporte con el usuario autenticado
          });

          return res.status(201).json({ message: 'Sales report created successfully', report: newReport });
        } catch (error) {
          console.error('Error creating report:', error);
          return res.status(500).json({ message: 'Error creating report' });
        }
      }

      default:
        return res.setHeader('Allow', ['GET', 'POST']).status(405).json({ message: `Method ${method} Not Allowed` });
    }
  });
}
