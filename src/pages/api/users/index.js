import Users from '../../../models/UserModel';
import { hash } from 'bcryptjs';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      authenticateToken(req, res, async () => {
        const users = await Users.findAll();
        res.status(200).json(users);
      });
    } else if (req.method === 'POST') {
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

      res.status(201).json({ message: 'User created successfully', newUser });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in users/index:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
