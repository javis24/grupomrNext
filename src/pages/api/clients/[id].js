import Clients from '../../../models/ClientModel.js';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  authenticateToken(req, res, async () => {
    const { method } = req;
    const { role: userRole, id: userId } = req.user; // Obtener rol y userId del token

    switch (method) {
      case 'PUT': {
        const { fullName, companyName, companyPhone, businessTurn, address, contactName, contactPhone, email, position, planta, producto, assignedUser, billingContactName, billingPhone, billingEmail,
          usoCFDI, paymentMethod, paymentConditions, billingDepartment  } = req.body;

        // Validar los campos requeridos
        if (!fullName || !companyName || !businessTurn || !address || !planta) {
          return res.status(400).json({ message: "Full Name, Company Name, Business Turn, Address y Planta son requeridos" });
        }

        try {
          const client = await Clients.findByPk(id);

          if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
          }

          // Verificar permisos: vendedores solo pueden actualizar clientes que ellos crearon
          if (userRole === 'vendedor' && client.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para actualizar este cliente' });
          }

          // Actualizar cliente con los nuevos valores (solo si se proporcionaron)
          client.fullName = fullName || client.fullName;
          client.companyName = companyName || client.companyName;
          client.companyPhone = companyPhone|| client.companyPhone;   
          client.businessTurn = businessTurn || client.businessTurn;
          client.address = address || client.address;
          client.contactName = contactName || client.contactName;
          client.contactPhone = contactPhone || client.contactPhone;
          client.email = email || client.email;
          client.position = position || client.position;
          client.planta = planta || client.planta;
          client.producto = producto || client.producto;
          client.assignedUser = assignedUser || client.assignedUser;
          client.billingContactName = billingContactName || client.billingContactName;
          client.billingPhone = billingPhone || client.billingPhone;
          client.billingEmail = billingEmail || client.billingEmail;
          client.usoCFDI = usoCFDI || client.usoCFDI;
          client.paymentMethod = paymentMethod || client.paymentMethod;
          client.paymentConditions = paymentConditions || client.paymentConditions;
          client.billingDepartment = billingDepartment || client.billingDepartment;
          await client.save();

          return res.status(200).json({ message: "Cliente actualizado con éxito", client });
        } catch (error) {
          console.error('Error actualizando el cliente:', error);
          return res.status(500).json({ message: 'Error actualizando el cliente', error });
        }
      }

      case 'DELETE': {
        try {
          const client = await Clients.findByPk(id);

          if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
          }

          // Verificar permisos: vendedores solo pueden eliminar clientes que ellos crearon
          if (userRole === 'vendedor' && client.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este cliente' });
          }

          await client.destroy();

          return res.status(200).json({ message: 'Cliente eliminado con éxito' });
        } catch (error) {
          console.error('Error eliminando el cliente:', error);
          return res.status(500).json({ message: 'Error eliminando el cliente', error });
        }
      }

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  });
}
