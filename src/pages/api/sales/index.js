import SalesReport from '../../../models/SalesReportModel';
import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
  const { method } = req;

  // Autenticación del token y obtención de datos del usuario
  authenticateToken(req, res, async () => {
    const { role: userRole, id: userId } = req.user;

    try {
      switch (method) {
        case 'GET': {
          let reports;
          if (userRole === 'vendedor') {
            // Si el usuario es vendedor, solo puede ver los reportes que él creó
            reports = await SalesReport.findAll({
              where: { userId },
              include: [
                {
                  model: Users,
                  as: 'User',
                  attributes: ['name'], // Solo traer el nombre del usuario
                },
              ],
            });
          } else {
            // Si el usuario es admin o gerencia, puede ver todos los reportes
            reports = await SalesReport.findAll({
              include: [
                {
                  model: Users,
                  as: 'User',
                  attributes: ['name'], // Solo traer el nombre del usuario
                },
              ],
            });
          }

          if (!reports || reports.length === 0) {
            return res.status(200).json([]);  // Devolver array vacío si no hay reportes
          }

          // Enviar los reportes obtenidos al cliente
          return res.status(200).json(reports);
        }

        case 'POST': {
          const {
            clienteProveedorProspecto,
            empresa,
            unidadNegocio,
            productoServicio,
            comentarios,
            status,
            extraText,
            detalles,
          } = req.body;

          if (!clienteProveedorProspecto || !empresa || !unidadNegocio || !productoServicio || !status || !extraText || !detalles) {
            return res.status(400).json({ message: 'Required fields are missing' });
          }

          const newReport = await SalesReport.create({
            clienteProveedorProspecto,
            empresa,
            unidadNegocio,
            productoServicio,
            comentarios,
            status,
            extraText,   // Nuevo campo agregado
            detalles,    // Nuevo campo agregado
            userId,      // Asociar el reporte con el usuario autenticado
          });

          return res.status(201).json({ message: 'Sales report created successfully', report: newReport });
        }

        default:
          return res.setHeader('Allow', ['GET', 'POST']).status(405).json({ message: `Method ${method} Not Allowed` });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
}
