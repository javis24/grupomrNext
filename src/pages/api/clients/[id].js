import db from '../../../config/Database.js';
import { authenticateToken } from '../../../lib/auth';
import Clients from '../../../models/ClientModel.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    authenticateToken(req, res, async () => {
      const { fullName, companyName, businessTurn, address, contactName, contactPhone, email, position, userId } = req.body;

      if (!fullName || !companyName || !businessTurn || !address || !userId) {
        return res.status(400).json({ message: "Full Name, Company Name, Business Turn, Address y User ID son requeridos" });
      }

      try {
        const client = await Clients.findByPk(id);
        if (!client) {
          return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        client.fullName = fullName || client.fullName;
        client.companyName = companyName || client.companyName;
        client.businessTurn = businessTurn || client.businessTurn;
        client.address = address || client.address;
        client.contactName = contactName || client.contactName;
        client.contactPhone = contactPhone || client.contactPhone;
        client.email = email || client.email;
        client.position = position || client.position;
        client.userId = userId;

        await client.save();

        res.status(200).json({ message: "Cliente actualizado con éxito", client });
      } catch (error) {
        console.error('Error actualizando el cliente:', error);
        res.status(500).json({ message: 'Error actualizando el cliente' });
      }
    });
  } else if (req.method === 'DELETE') {
    authenticateToken(req, res, async () => {
      try {
        const client = await Clients.findByPk(id);
        if (!client) {
          return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        await client.destroy();

        res.status(200).json({ message: 'Cliente eliminado con éxito' });
      } catch (error) {
        console.error('Error eliminando el cliente:', error);
        res.status(500).json({ message: 'Error eliminando el cliente' });
      }
    });
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
