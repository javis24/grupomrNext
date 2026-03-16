import Clients from '../../../models/ClientModel';
import { authenticateToken } from '../../../lib/auth';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  authenticateToken(req, res, async () => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(200).json([]);

    try {
      const filteredClients = await Clients.findAll({
        where: { fullName: { [Op.like]: `%${q}%` } },
        limit: 8,
        // IMPORTANTE: Traemos el teléfono del modelo de clientes
        attributes: ['id', 'fullName', 'contactPhone', 'assignedUser'], 
      });
      return res.status(200).json(filteredClients);
    } catch (error) {
      return res.status(500).json({ message: 'Error en búsqueda' });
    }
  });
}