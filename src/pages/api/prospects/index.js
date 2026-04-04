import { authenticateToken } from '../../../lib/auth';
import Prospect from '../../../models/ProspectModel';

export default async function handler(req, res) {
  authenticateToken(req, res, async () => {
    const { method } = req;
    const { id: loggedUserId, role } = req.user;

    try {
      switch (method) {
        case 'GET':
          // REGLA: Admin ve todo, Vendedor solo lo suyo
          const whereClause = role === 'admin' ? {} : { userId: loggedUserId };
          const prospects = await Prospect.findAll({ 
            where: whereClause,
            order: [['createdAt', 'DESC']] 
          });
          return res.status(200).json(prospects);

        case 'POST':
          const { saleProcess, contactName, company, phone, email } = req.body;
          if (!saleProcess || !contactName || !company || !phone || !email) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
          }

          const newProspect = await Prospect.create({
            saleProcess,
            contactName,
            company,
            phone,
            email,
            userId: loggedUserId, // Forzamos el ID del token
          });
          return res.status(201).json(newProspect);

        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).end();
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}