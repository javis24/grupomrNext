import Users from '../../../models/UserModel';
import { authenticateToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  const { method, query } = req;

  return authenticateToken(req, res, async () => {
    const { role: userRole } = req.user;

    if (!userRole) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    try {
      switch (method) {
        case 'GET': {
          if (query.active === 'true') {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            const activeUsers = await Users.findAll({
              where: {
                isActive: true,
                lastActive: {
                  [Op.gt]: oneHourAgo,
                },
              },
              attributes: ['id', 'name', 'email', 'role', 'lastActive', 'isActive'],
              order: [['name', 'ASC']],
            });

            return res.status(200).json(activeUsers);
          }

          if (userRole !== 'admin' && userRole !== 'gerencia') {
            return res.status(403).json({
              message: 'No tienes permiso para ver usuarios',
            });
          }

          const users = await Users.findAll({
            where: {
              isActive: true,
            },
            attributes: ['id', 'uuid', 'name', 'email', 'role', 'lastActive', 'isActive', 'createdAt', 'updatedAt'],
            order: [['name', 'ASC']],
          });

          return res.status(200).json(users);
        }

        case 'POST': {
          if (userRole !== 'admin' && userRole !== 'gerencia') {
            return res.status(403).json({
              message: 'No tienes permiso para crear usuarios',
            });
          }

          const { name, email, password, role } = req.body;

          if (!(name && email && password && role)) {
            return res.status(400).json({
              message: 'Todos los campos son requeridos',
            });
          }

          const existingUser = await Users.findOne({
            where: { email },
          });

          if (existingUser && existingUser.isActive) {
            return res.status(400).json({
              message: 'El usuario ya existe',
            });
          }

          if (existingUser && !existingUser.isActive) {
            return res.status(400).json({
              message: 'Este correo pertenece a un usuario dado de baja. Edita o reactiva el usuario desde base de datos si deseas reutilizarlo.',
            });
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          const newUser = await Users.create({
            name,
            email,
            password: hashedPassword,
            role,
            isActive: true,
          });

          return res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              isActive: newUser.isActive,
            },
          });
        }

        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({
            message: `Método ${method} no permitido`,
          });
      }
    } catch (error) {
      console.error('Error en el servidor:', error);

      return res.status(500).json({
        message: 'Error del servidor',
        error: error.message,
      });
    }
  });
}