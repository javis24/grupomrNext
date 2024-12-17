import Clients from '../../../models/ClientModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    switch (method) {
      case 'GET': {
        try {
          // Obtener únicamente fullName y contactPhone de todos los clientes
          const clients = await Clients.findAll({
            attributes: ['id', 'fullName', 'contactPhone'], // Solo estos campos
          });

          return res.status(200).json(clients);
        } catch (error) {
          console.error('Error fetching client names and phones:', error);
          return res.status(500).json({ message: 'Error fetching client names and phones' });
        }
      }

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  });
}
