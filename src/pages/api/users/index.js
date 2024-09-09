import Users from '../../../models/UserModel';
import { hash } from 'bcryptjs';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { method } = req;

  try {
    authenticateToken(req, res, async () => {
      const { role: userRole } = req.user; // Obtener el rol del usuario autenticado

      switch (method) {
        case 'GET':
          // Obtener todos los usuarios (solo permitido para roles admin y gerencia)
          if (userRole !== 'admin' && userRole !== 'gerencia') {
            return res.status(403).json({ message: 'You do not have permission to view users' });
          }

          const users = await Users.findAll();
          return res.status(200).json(users);

        case 'POST':
          // Crear un nuevo usuario (solo permitido para roles admin y gerencia)
          if (userRole !== 'admin' && userRole !== 'gerencia') {
            return res.status(403).json({ message: 'You do not have permission to create users' });
          }

          const { name, email, password, role } = req.body;

          if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
          }

          const hashedPassword = await hash(password, 10);

          const newUser = await Users.create({
            name,
            email,
            password: hashedPassword,
            role
          });

          return res.status(201).json({ message: 'User created successfully', newUser });

        case 'PUT':
          // Actualizar un usuario existente (solo permitido para admin y gerencia)
          if (userRole !== 'admin' && userRole !== 'gerencia') {
            return res.status(403).json({ message: 'You do not have permission to update users' });
          }

          const { id, ...updatedData } = req.body; // El ID del usuario y los nuevos datos

          if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
          }

          const user = await Users.findByPk(id);

          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Actualizar solo los campos permitidos
          if (updatedData.password) {
            updatedData.password = await hash(updatedData.password, 10); // Hashear la nueva contraseña
          }

          await user.update(updatedData);

          return res.status(200).json({ message: 'User updated successfully', user });

        case 'DELETE':
          // Eliminar un usuario existente (solo permitido para admin y gerencia)
          if (userRole !== 'admin' && userRole !== 'gerencia') {
            return res.status(403).json({ message: 'You do not have permission to delete users' });
          }

          const { userId } = req.body; // ID del usuario a eliminar

          if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
          }

          const userToDelete = await Users.findByPk(userId);

          if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Eliminar el usuario
          await userToDelete.destroy();

          return res.status(200).json({ message: 'User deleted successfully' });

        default:
          // Método HTTP no permitido
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).end(`Method ${method} Not Allowed`);
      }
    });
  } catch (error) {
    console.error('Error in users/index:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
