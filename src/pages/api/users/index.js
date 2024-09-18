import Users from '../../../models/UserModel';
import { authenticateToken } from '../../../lib/auth';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  const { method, query } = req;

  authenticateToken(req, res, async () => {
    const { role: userRole } = req.user;

    if (!userRole) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    try {
      switch (method) {
        case 'GET':
          // Verificar si se pide obtener usuarios activos
          if (query.active === 'true') {
            if (userRole !== 'admin') {
              return res.status(403).json({ message: 'No tienes permiso para ver usuarios activos' });
            }

            // Definir que son usuarios activos si estuvieron activos en la última hora
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            const activeUsers = await Users.findAll({
              where: {
                lastActive: {
                  [Op.gt]: oneHourAgo, // Obtener usuarios activos en la última hora
                },
              },
              attributes: ['name', 'email', 'lastActive'],
            });

            return res.status(200).json(activeUsers); // Enviar usuarios activos al frontend
          }

          // Obtener todos los usuarios (admin o gerencia)
          if (userRole !== 'admin' && userRole !== 'gerencia') {
            return res.status(403).json({ message: 'No tienes permiso para ver usuarios' });
          }

          const users = await Users.findAll();
          return res.status(200).json(users);

        default:
          res.setHeader('Allow', ['GET']);
          return res.status(405).end(`Método ${method} no permitido`);
      }
    } catch (error) {
      console.error('Error en el servidor:', error);
      return res.status(500).json({ message: 'Error del servidor', error });
    }
  });
}
