import Clients from '../../../models/ClientModel.js';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  return new Promise((resolve) => {
    authenticateToken(req, res, async () => {
      const { method } = req;
      const { role: userRole, id: userId } = req.user;

      try {
        const client = await Clients.findByPk(id);

        if (!client) {
          res.status(404).json({ message: 'Cliente no encontrado' });
          return resolve();
        }

        if (userRole === 'vendedor' && client.userId !== userId) {
          res.status(403).json({ message: 'No tienes permiso' });
          return resolve();
        }

        if (method === 'PUT') {
          const {
            fullName,
            companyName,
            businessTurn,
            address,
            contactName,
            companyPhone,
            contactPhone,
            email,
            position,
            planta,
            producto,
            assignedUser,
            billingContactName,
            billingPhone,
            billingEmail,
            usoCFDI,
            paymentMethod,
            paymentConditions,
            billingDepartment,
          } = req.body;

          const payload = {
            fullName,
            companyName,
            businessTurn,
            address,
            contactName,
            companyPhone: companyPhone ? String(companyPhone).trim() : null,
            contactPhone: contactPhone ? String(contactPhone).trim() : null,
            email: email ? String(email).trim() : null,
            position,
            planta,
            producto,
            assignedUser: assignedUser ? String(assignedUser).trim() : null,
            billingContactName,
            billingPhone: billingPhone ? String(billingPhone).trim() : null,
            billingEmail: billingEmail ? String(billingEmail).trim() : null,
            usoCFDI,
            paymentMethod,
            paymentConditions,
            billingDepartment,
          };

          await client.update(payload);

          res.status(200).json({
            message: 'Cliente actualizado correctamente',
            client,
          });

          return resolve();
        }

        if (method === 'DELETE') {
          if (userRole !== 'admin') {
            res.status(403).json({
              message: 'Solo administradores pueden eliminar clientes',
            });
            return resolve();
          }

          await client.destroy();

          res.status(200).json({ message: 'Eliminado' });
          return resolve();
        }

        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).json({ message: 'Método no permitido' });
        return resolve();

      } catch (error) {
        console.error('ERROR EN API CLIENTS [ID]:', error);

        res.status(500).json({
          message: 'Error interno al actualizar cliente',
          error: error.message,
        });

        return resolve();
      }
    });
  });
}