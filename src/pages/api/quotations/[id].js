import Quotation from '../../../models/QuotationModel.js';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  authenticateToken(req, res, async () => {
    const { method } = req;
    const { role: userRole, id: userId } = req.user;

    switch (method) {
      case 'PUT': {
        const {
          empresa, domicilio, atencionA, telefono, movil, departamento,
          correoElectronico, supervisorAsignado, fecha, descripcion,
          cantidad, unidad, precioUnitario, total, comentarios
        } = req.body;

        if (!empresa || !domicilio || !atencionA || !telefono || !descripcion || !cantidad || !precioUnitario || !total) {
          return res.status(400).json({ message: 'Campos requeridos están vacíos' });
        }

        try {
          const quotation = await Quotation.findByPk(id);

          if (!quotation) {
            return res.status(404).json({ message: 'Cotización no encontrada' });
          }

          if (userRole === 'vendedor' && quotation.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para actualizar esta cotización' });
          }

          await quotation.update({
            empresa, domicilio, atencionA, telefono, movil, departamento,
            correoElectronico, supervisorAsignado, fecha, descripcion,
            cantidad, unidad, precioUnitario, total, comentarios
          });

          return res.status(200).json({ message: 'Cotización actualizada con éxito', quotation });
        } catch (error) {
          console.error('Error actualizando la cotización:', error);
          return res.status(500).json({ message: 'Error actualizando la cotización' });
        }
      }

      case 'DELETE': {
        try {
          const quotation = await Quotation.findByPk(id);

          if (!quotation) {
            return res.status(404).json({ message: 'Cotización no encontrada' });
          }

          if (userRole === 'vendedor' && quotation.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta cotización' });
          }

          await quotation.destroy();

          return res.status(200).json({ message: 'Cotización eliminada con éxito' });
        } catch (error) {
          console.error('Error eliminando la cotización:', error);
          return res.status(500).json({ message: 'Error eliminando la cotización' });
        }
      }

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  });
}
