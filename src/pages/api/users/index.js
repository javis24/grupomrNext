import Users from '../../../models/UserModel';
import { authenticateToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs'; // Para hashear las contraseñas
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
          // Código para manejar GET (sin cambios)
          if (query.active === 'true') {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const activeUsers = await Users.findAll({
              where: {
                lastActive: {
                  [Op.gt]: oneHourAgo,
                },
              },
              attributes: ['name', 'email', 'lastActive'],
            });
            return res.status(200).json(activeUsers);
          }
          if (userRole !== 'admin' && userRole !== 'gerencia') {
            return res.status(403).json({ message: 'No tienes permiso para ver usuarios' });
          }
          const users = await Users.findAll();
          return res.status(200).json(users);

        case 'POST':
          // Código para manejar POST (nueva sección para crear usuarios)
          const { name, email, password, role } = req.body;

          if (!(name && email && password && role)) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
          }

          // Verificar si el usuario ya existe
          const existingUser = await Users.findOne({ where: { email } });
          if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
          }

          // Hashear la contraseña
          const hashedPassword = await bcrypt.hash(password, 10);

          // Crear el nuevo usuario
          const newUser = await Users.create({
            name,
            email,
            password: hashedPassword,
            role,
          });

          return res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });

        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).end(`Método ${method} no permitido`);
      }
    } catch (error) {
      console.error('Error en el servidor:', error);
      return res.status(500).json({ message: 'Error del servidor', error });
    }

    
  });
}
