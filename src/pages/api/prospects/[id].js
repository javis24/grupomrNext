import { authenticateToken } from '../../../lib/auth';
import Prospect from '../../../models/ProspectModel';

export default async function handler(req, res) {
  const { id } = req.query;

  return authenticateToken(req, res, async () => {
    const { method } = req;
    const { role, id: loggedUserId } = req.user;

    try {
      const prospect = await Prospect.findByPk(id);

      if (!prospect) {
        return res.status(404).json({
          message: 'Prospecto no encontrado',
        });
      }

      switch (method) {
        case 'GET':
          return res.status(200).json(prospect);

        case 'PUT': {
          const canEdit =
            role === 'admin' ||
            role === 'gerencia' ||
            Number(prospect.userId) === Number(loggedUserId);

          if (!canEdit) {
            return res.status(403).json({
              message: 'No tienes permiso para editar este prospecto',
            });
          }

          const {
            saleProcess,
            contactName,
            company,
            address,
            phone,
            email,
            planta,
          } = req.body;

          if (!saleProcess || !contactName || !company || !phone || !email) {
            return res.status(400).json({
              message: 'Todos los campos son obligatorios',
            });
          }

          await prospect.update({
            saleProcess,
            contactName,
            company,
            address,
            phone,
            email,
            planta: planta && String(planta).trim() !== ''
              ? String(planta).trim()
              : null,
          });

          return res.status(200).json({
            message: 'Prospecto actualizado correctamente',
            prospect,
          });
        }

        case 'DELETE': {
          if (role !== 'admin' && role !== 'gerencia') {
            return res.status(403).json({
              message: 'Solo administradores o gerencia pueden eliminar registros',
            });
          }

          await prospect.destroy();

          return res.status(200).json({
            message: 'Prospecto eliminado exitosamente',
          });
        }

        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({
            message: `Método ${method} no permitido`,
          });
      }
    } catch (error) {
      console.error('Error API prospecto por ID:', error);

      return res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  });
}