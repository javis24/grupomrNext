import Clients from '../../models/ClientModel';
import db from '../../config/Database';
import { authenticateToken } from '../../lib/auth';

db.sync(); // Sincronizar con la base de datos

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return authenticateToken(req, res, async () => {
        try {
          const clients = await Clients.findAll();
          return res.status(200).json(clients);
        } catch (error) {
          console.error('Error fetching clients:', error);
          return res.status(500).json({ message: 'Error fetching clients.' });
        }
      });

    case 'POST':
      return authenticateToken(req, res, async () => {
        const { fullName, contactName, contactPhone, position, userId } = req.body;

        if (!fullName || !userId) {
          return res.status(400).json({ message: 'Full name and User ID are required.' });
        }

        try {
          const newClient = await Clients.create({
            fullName,
            contactName,
            contactPhone,
            position,
            userId,
          });

          return res.status(201).json(newClient);
        } catch (error) {
          console.error('Error creating client:', error);
          return res.status(500).json({ message: 'Error creating client.' });
        }
      });

    case 'PUT':
      return authenticateToken(req, res, async () => {
        const { id } = req.query; // Assume the client's ID is passed as a query parameter
        const { fullName, contactName, contactPhone, position } = req.body;

        try {
          const client = await Clients.findByPk(id);

          if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
          }

          // Actualizar los datos del cliente
          client.fullName = fullName || client.fullName;
          client.contactName = contactName || client.contactName;
          client.contactPhone = contactPhone || client.contactPhone;
          client.position = position || client.position;

          await client.save();

          return res.status(200).json(client);
        } catch (error) {
          console.error('Error updating client:', error);
          return res.status(500).json({ message: 'Error updating client.' });
        }
      });

    case 'DELETE':
      return authenticateToken(req, res, async () => {
        const { id } = req.query;

        try {
          const client = await Clients.findByPk(id);

          if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
          }

          await client.destroy();
          return res.status(200).json({ message: 'Client deleted successfully.' });
        } catch (error) {
          console.error('Error deleting client:', error);
          return res.status(500).json({ message: 'Error deleting client.' });
        }
      });

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
