import Clients from '../../../models/ClientModel.js';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  return new Promise((resolve) => {
    authenticateToken(req, res, async () => {
      const { method } = req;
      const { role: userRole } = req.user;

      try {
        const client = await Clients.findByPk(id);

        if (!client) {
          res.status(404).json({ message: 'Cliente no encontrado' });
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
            fullName: fullName?.trim() || client.fullName,
            companyName: companyName?.trim() || client.companyName,
            businessTurn: businessTurn?.trim() || client.businessTurn,
            address: address?.trim() || client.address,

            contactName: contactName?.trim() || null,
            companyPhone: companyPhone?.trim() || null,
            contactPhone: contactPhone?.trim() || null,
            email: email?.trim() || null,
            position: position?.trim() || null,

            planta: planta?.trim() || null,
            producto: producto?.trim() || null,

            assignedUser: assignedUser?.trim() || null,

            billingContactName: billingContactName?.trim() || null,
            billingPhone: billingPhone?.trim() || null,
            billingEmail: billingEmail?.trim() || null,

            usoCFDI: usoCFDI?.trim() || null,
            paymentMethod: paymentMethod?.trim() || null,
            paymentConditions: paymentConditions?.trim() || null,
            billingDepartment: billingDepartment?.trim() || null,
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

          res.status(200).json({ message: 'Cliente eliminado correctamente' });
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