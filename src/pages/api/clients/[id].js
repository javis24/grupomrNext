import db from '../../../config/Database.js';
import { authenticateToken } from '../../../lib/auth';
import Clients from '../../../models/ClientModel.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    authenticateToken(req, res, async () => {
      const { role: userRole, id: userId } = req.user;  // Obtener rol y userId del token
      const { fullName, companyName, businessTurn, address, contactName, contactPhone, email, position } = req.body;

      // Validar los campos requeridos
      if (!fullName || !companyName || !businessTurn || !address) {
        return res.status(400).json({ message: "Full Name, Company Name, Business Turn y Address son requeridos" });
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

        // Actualizar cliente
        client.fullName = fullName || client.fullName;
        client.companyName = companyName || client.companyName;
        client.businessTurn = businessTurn || client.businessTurn;
        client.address = address || client.address;
        client.contactName = contactName || client.contactName;
        client.contactPhone = contactPhone || client.contactPhone;
        client.email = email || client.email;
        client.position = position || client.position;

        await client.save();

        return res.status(200).json({ message: "Cliente actualizado con éxito", client });
      } catch (error) {
        console.error('Error actualizando el cliente:', error);
        return res.status(500).json({ message: 'Error actualizando el cliente' });
      }
    });
  } else if (req.method === 'DELETE') {
    authenticateToken(req, res, async () => {
      const { role: userRole, id: userId } = req.user;  // Obtener rol y userId del token

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
        return res.status(500).json({ message: 'Error eliminando el cliente' });
      }
    });
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
