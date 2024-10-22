import SalesReport from '../../../models/SalesReportModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    authenticateToken(req, res, async () => {
      const { role: userRole, id: userId } = req.user;
      const { clienteProveedorProspecto, empresa, unidadNegocio, productoServicio, comentarios, status } = req.body;

      try {
        const report = await SalesReport.findByPk(id);
        if (!report) {
          return res.status(404).json({ message: 'Sales report not found' });
        }

        // Verificar permisos para actualizar
        if (userRole === 'vendedor' && report.userId !== userId) {
          return res.status(403).json({ message: 'You do not have permission to update this report' });
        }

        // Actualizar reporte
        report.clienteProveedorProspecto = clienteProveedorProspecto || report.clienteProveedorProspecto;
        report.empresa = empresa || report.empresa;
        report.unidadNegocio = unidadNegocio || report.unidadNegocio;
        report.productoServicio = productoServicio || report.productoServicio;
        report.comentarios = comentarios || report.comentarios;
        report.status = status || report.status;

        await report.save();

        return res.status(200).json({ message: "Sales report updated successfully", report });
      } catch (error) {
        console.error('Error updating report:', error);
        return res.status(500).json({ message: 'Error updating report' });
      }
    });
  } else if (req.method === 'DELETE') {
    authenticateToken(req, res, async () => {
      const { role: userRole, id: userId } = req.user;

      try {
        const report = await SalesReport.findByPk(id);
        if (!report) {
          return res.status(404).json({ message: 'Sales report not found' });
        }

        // Verificar permisos para eliminar
        if (userRole === 'vendedor' && report.userId !== userId) {
          return res.status(403).json({ message: 'You do not have permission to delete this report' });
        }

        await report.destroy();

        return res.status(200).json({ message: 'Sales report deleted successfully' });
      } catch (error) {
        console.error('Error deleting report:', error);
        return res.status(500).json({ message: 'Error deleting report' });
      }
    });
  } else {
    return res.setHeader('Allow', ['PUT', 'DELETE']).status(405).end(`Method ${req.method} Not Allowed`);
  }
}
