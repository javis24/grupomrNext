import Clients from '../../../models/ClientModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { method } = req;

  // Verificar autenticación del usuario
  authenticateToken(req, res, async () => {
    const { role: userRole, id: userId } = req.user;

    switch (method) {
      case 'GET':
        // Obtener clientes
        try {
          let clients;
          if (userRole === 'vendedor') {
            // Si el usuario es vendedor, solo puede ver los clientes que él creó
            clients = await Clients.findAll({
              where: { userId },
            });
          } else {
            // Si el usuario es admin, gerencia o coordinador, puede ver todos los clientes
            clients = await Clients.findAll();
          }

          if (!clients || clients.length === 0) {
            return res.status(200).json([]); // Devolver un array vacío si no hay clientes
          }

          return res.status(200).json(clients);
        } catch (error) {
          console.error('Error fetching clients:', error);
          return res.status(500).json({ message: 'Error fetching clients' });
        }

      case 'POST':
        // Crear cliente
        const { fullName, companyName, businessTurn, address, contactName, contactPhone, email, position } = req.body;

        if (!fullName || !companyName || !businessTurn || !address) {
          return res.status(400).json({ message: 'Required fields are missing' });
        }

        try {
          // Crear nuevo cliente y asociarlo con el usuario autenticado
          const newClient = await Clients.create({
            fullName,
            companyName,
            businessTurn,
            address,
            contactName,
            contactPhone,
            email,
            position,
            userId, // Asociar cliente con el usuario autenticado
          });

          return res.status(201).json({ message: 'Client created successfully', client: newClient });
        } catch (error) {
          console.error('Error creating client:', error);
          return res.status(500).json({ message: 'Error creating client' });
        }

      case 'PUT':
        // Actualizar cliente
        const { id, ...updatedData } = req.body; // El ID y los nuevos datos del cliente

        if (!id) {
          return res.status(400).json({ message: 'Client ID is required' });
        }

        try {
          const client = await Clients.findByPk(id);

          if (!client) {
            return res.status(404).json({ message: 'Client not found' });
          }

          // Verificar si el usuario tiene permisos para actualizar (admin, gerencia o el vendedor que creó el cliente)
          if (userRole === 'vendedor' && client.userId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to update this client' });
          }

          // Actualizar el cliente con los nuevos datos
          await client.update(updatedData);

          return res.status(200).json({ message: 'Client updated successfully', client });
        } catch (error) {
          console.error('Error updating client:', error);
          return res.status(500).json({ message: 'Error updating client' });
        }

      case 'DELETE':
        // Eliminar cliente
        const { clientId } = req.body; // ID del cliente a eliminar

        if (!clientId) {
          return res.status(400).json({ message: 'Client ID is required' });
        }

        try {
          const client = await Clients.findByPk(clientId);

          if (!client) {
            return res.status(404).json({ message: 'Client not found' });
          }

          // Verificar si el usuario tiene permisos para eliminar (admin, gerencia o el vendedor que creó el cliente)
          if (userRole === 'vendedor' && client.userId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this client' });
          }

          // Eliminar el cliente
          await client.destroy();

          return res.status(200).json({ message: 'Client deleted successfully' });
        } catch (error) {
          console.error('Error deleting client:', error);
          return res.status(500).json({ message: 'Error deleting client' });
        }

      default:
        // Si el método HTTP no es compatible
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  });
}
