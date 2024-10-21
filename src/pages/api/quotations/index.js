import Quotation from '../../../models/QuotationModel.js';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    const { role: userRole, id: userId } = req.user;

    switch (method) {
      case 'GET': {
        try {
          let quotations;
          if (userRole === 'vendedor') {
            quotations = await Quotation.findAll({
              where: { userId },
            });
          } else {
            quotations = await Quotation.findAll();
          }

          return res.status(200).json(quotations);
        } catch (error) {
          console.error('Error fetching quotations:', error);
          return res.status(500).json({ message: 'Error fetching quotations' });
        }
      }

      case 'POST': {
        const {
          empresa, domicilio, atencionA, telefono, movil, departamento,
          correoElectronico, supervisorAsignado, fecha, descripcion,
          cantidad, unidad, precioUnitario, total, comentarios
        } = req.body;

        if (!empresa || !domicilio || !atencionA || !telefono || !descripcion || !cantidad || !precioUnitario || !total) {
          return res.status(400).json({ message: 'Campos requeridos están vacíos' });
        }

        try {
          const newQuotation = await Quotation.create({
            empresa, domicilio, atencionA, telefono, movil, departamento,
            correoElectronico, supervisorAsignado, fecha, descripcion,
            cantidad, unidad, precioUnitario, total, comentarios,
            userId  // Asociar la cotización con el usuario autenticado
          });

          return res.status(201).json({ message: 'Cotización creada exitosamente', quotation: newQuotation });
        } catch (error) {
          console.error('Error creating quotation:', error);
          return res.status(500).json({ message: 'Error creating quotation' });
        }
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  });
}
