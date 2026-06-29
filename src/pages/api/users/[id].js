import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  return authenticateToken(req, res, async () => {
    const { id: loggedUserId, role: loggedUserRole } = req.user;

    try {
      const user = await Users.findByPk(id);

      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado',
        });
      }

      if (loggedUserRole !== 'admin' && loggedUserRole !== 'gerencia') {
        return res.status(403).json({
          message: 'No tienes permiso para gestionar usuarios',
        });
      }

      switch (method) {
        case 'GET':
          return res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          });

        case 'PUT': {
          const { name, email, password, role } = req.body;

          if (!(name && email && role)) {
            return res.status(400).json({
              message: 'Nombre, Email y Rol son requeridos',
            });
          }

          const updatedData = {
            name,
            email,
            role,
          };

          if (password && password.trim() !== '') {
            updatedData.password = await bcrypt.hash(password, 10);
          }

          await user.update(updatedData);

          return res.status(200).json({
            message: 'Usuario actualizado con éxito',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            },
          });
        }

        case 'DELETE': {
          if (Number(id) === Number(loggedUserId)) {
            return res.status(400).json({
              message: 'No puedes dar de baja tu propio usuario',
            });
          }

          if (user.role === 'admin') {
            return res.status(400).json({
              message: 'No se recomienda dar de baja usuarios administradores desde esta pantalla',
            });
          }

          await user.update({
            isActive: false,
          });

          return res.status(200).json({
            message: 'Usuario dado de baja correctamente. Sus registros históricos se conservarán.',
          });
        }

        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({
            message: `Método ${method} no permitido`,
          });
      }
    } catch (error) {
      console.error(`Error en la operación ${method}:`, error);

      return res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  });
}