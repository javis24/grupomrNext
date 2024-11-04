import SalesReport from '../../../models/SalesReportModel';
import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
  const { method } = req;

  // Autenticación del token y obtención de datos del usuario
  authenticateToken(req, res, async () => {
    const { email, id: userId } = req.user;

    try {
      switch (method) {
        case 'GET': {
          let reports;
          
          if (email === 'coordinadora@grupomrlaguna.com') {
            // Si el usuario es la coordinadora, puede ver todos los reportes
            reports = await SalesReport.findAll({
              include: [
                {
                  model: Users,
                  as: 'User',
                  attributes: ['name'],
                },
              ],
            });
          } else {
            // Si el usuario no es la coordinadora, solo puede ver sus propios reportes
            reports = await SalesReport.findAll({
              where: { userId },
              include: [
                {
                  model: Users,
                  as: 'User',
                  attributes: ['name'],
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
            extraText,
            detalles,
            userId,
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
