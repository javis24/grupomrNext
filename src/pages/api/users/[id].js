import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    authenticateToken(req, res, async () => {
      try {
        const user = await Users.findByPk(id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Error fetching user' });
      }
    });
  } else if (req.method === 'PUT') {
    authenticateToken(req, res, async () => {
      const { name, email, password, role } = req.body;

      if (!(name && email && role)) {
        return res.status(400).json({ message: 'Name, Email, and Role are required' });
      }

      try {
        const user = await Users.findByPk(id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const updatedData = { name, email, role };

        // Solo actualizar la contraseña si se proporciona
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10); // Hashear la nueva contraseña
          updatedData.password = hashedPassword;
        }

        await user.update(updatedData);
        res.status(200).json({ message: 'User updated successfully', user });
      } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Error updating user' });
      }
    });
  } else if (req.method === 'DELETE') {
    authenticateToken(req, res, async () => {
      try {
        const user = await Users.findByPk(id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Error deleting user' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
