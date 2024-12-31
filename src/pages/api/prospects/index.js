import { authenticateToken } from '../../../lib/auth';
import Prospect from '../../../models/ProspectModel';

export default async function handler(req, res) {
  authenticateToken(req, res, async () => {
    const { method } = req;

    switch (method) {
      case 'GET':
        try {
          const userId = req.user.id; // Asegúrate de que req.user tenga datos
          const prospects = await Prospect.findAll({ where: { userId } });
          return res.status(200).json(prospects);
        } catch (error) {
          console.error('Error al obtener prospectos:', error);
          return res.status(500).json({ message: 'Error al obtener prospectos' });
        }

      case 'POST':
        try {
          const userId = req.user.id; // Asegúrate de que req.user tenga datos
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
            userId,
          });

          return res.status(201).json(newProspect);
        } catch (error) {
          console.error('Error al crear prospecto:', error);
          return res.status(500).json({ message: 'Error al crear prospecto' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Método ${method} no permitido` });
    }
  });
}
