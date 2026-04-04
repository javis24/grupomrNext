import { authenticateToken } from '../../../lib/auth';
import Prospect from '../../../models/ProspectModel';

export default async function handler(req, res) {
  const { id } = req.query;

  authenticateToken(req, res, async () => {
    const { method } = req;
    const { role, id: loggedUserId } = req.user;

    try {
      const prospect = await Prospect.findByPk(id);
      if (!prospect) return res.status(404).json({ message: 'No encontrado' });

      switch (method) {
        case 'PUT':
          // El vendedor solo edita sus prospectos
          if (role !== 'admin' && prospect.userId !== loggedUserId) {
            return res.status(403).json({ message: "No tienes permiso para editar este prospecto" });
          }
          await prospect.update(req.body);
          return res.status(200).json({ message: 'Actualizado', prospect });

        case 'DELETE':
          // REGLA DE ORO: Solo el admin borra
          if (role !== 'admin') {
            return res.status(403).json({ message: "Solo administradores pueden eliminar registros" });
          }
          await prospect.destroy();
          return res.status(200).json({ message: 'Eliminado exitosamente' });

        default:
          return res.status(405).end();
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}