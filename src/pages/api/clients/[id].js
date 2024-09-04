import db from '../../../config/Database.js';
import { authenticateToken } from '../../../lib/auth';
import Clients from '../../../models/ClientModel.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    authenticateToken(req, res, async () => {
      const { fullName, contactName, contactPhone, position, userId } = req.body;

      if (!fullName || !userId) {
        return res.status(400).json({ message: "Full Name and User ID are required" });
      }

      try {
        const client = await Clients.findByPk(id);
        if (!client) {
          return res.status(404).json({ message: 'Client not found' });
        }

        client.fullName = fullName;
        client.contactName = contactName || client.contactName;
        client.contactPhone = contactPhone || client.contactPhone;
        client.position = position || client.position;
        client.userId = userId;

        await client.save();

        res.status(200).json({ message: "Client updated successfully", client });
      } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Error updating client' });
      }
    });
  } else if (req.method === 'DELETE') {
    authenticateToken(req, res, async () => {
      try {
        const client = await Clients.findByPk(id);
        if (!client) {
          return res.status(404).json({ message: 'Client not found' });
        }

        await client.destroy();

        res.status(200).json({ message: 'Client deleted successfully' });
      } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Error deleting client' });
      }
    });
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
