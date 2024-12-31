import Prospect from '../../../models/ProspectModel';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET': {
      try {
        const prospect = await Prospect.findByPk(id);
        if (!prospect) {
          return res.status(404).json({ error: 'Prospect not found' });
        }
        res.status(200).json(prospect);
      } catch (error) {
        console.error('Error fetching prospect:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;
    }

    case 'PUT': {
      try {
        const { saleProcess, contactName, company, phone, email } = req.body;

        const prospect = await Prospect.findByPk(id);
        if (!prospect) {
          return res.status(404).json({ error: 'Prospect not found' });
        }

        await prospect.update({ saleProcess, contactName, company, phone, email });

        res.status(200).json({
          message: 'Prospect updated successfully',
          prospect,
        });
      } catch (error) {
        console.error('Error updating prospect:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;
    }

    case 'DELETE': {
      try {
        const prospect = await Prospect.findByPk(id);
        if (!prospect) {
          return res.status(404).json({ error: 'Prospect not found' });
        }

        await prospect.destroy();

        res.status(200).json({ message: 'Prospect deleted successfully' });
      } catch (error) {
        console.error('Error deleting prospect:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']); // Incluye DELETE como permitido
      res.status(405).json({ error: `Method ${method} not allowed` });
  }
}
