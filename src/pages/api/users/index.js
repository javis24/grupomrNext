import Users from '../../../models/UserModel';
import { hash } from 'bcryptjs';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    const { role: userRole } = req.user;

    switch (method) {
      case 'GET':
        // Obtener todos los usuarios (solo permitido para roles admin y gerencia)
        if (userRole !== 'admin' && userRole !== 'gerencia') {
          return res.status(403).json({ message: 'You do not have permission to view users' });
        }

        try {
          const users = await Users.findAll();
          return res.status(200).json(users);
        } catch (error) {
          console.error('Error fetching users:', error);
          return res.status(500).json({ message: 'Error fetching users' });
        }

      case 'POST':
        // Crear un nuevo usuario
        if (userRole !== 'admin' && userRole !== 'gerencia') {
          return res.status(403).json({ message: 'You do not have permission to create users' });
        }

        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
          return res.status(400).json({ message: 'All fields are required' });
        }

        try {
          const hashedPassword = await hash(password, 10);
          const newUser = await Users.create({
            name,
            email,
            password: hashedPassword,
            role,
          });

          return res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (error) {
          console.error('Error creating user:', error);
          return res.status(500).json({ message: 'Error creating user' });
        }

      case 'PUT':
        // Actualizar usuario
        const { id, ...updatedData } = req.body;

        if (!id) {
          return res.status(400).json({ message: 'User ID is required' });
        }

        try {
          const user = await Users.findByPk(id);

          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          if (updatedData.password) {
            updatedData.password = await hash(updatedData.password, 10); // Hashear la nueva contraseña si está presente
          }

          await user.update(updatedData);
          return res.status(200).json({ message: 'User updated successfully', user });
        } catch (error) {
          console.error('Error updating user:', error);
          return res.status(500).json({ message: 'Error updating user' });
        }

      case 'DELETE':
        const { userId } = req.body;

        if (!userId) {
          return res.status(400).json({ message: 'User ID is required' });
        }

        try {
          const user = await Users.findByPk(userId);

          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          await user.destroy();
          return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
          console.error('Error deleting user:', error);
          return res.status(500).json({ message: 'Error deleting user' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  });
}
