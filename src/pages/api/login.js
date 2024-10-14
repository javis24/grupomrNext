// api/login.js
import Users from '../../models/UserModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, password } = req.body;

        try {
            // Buscar al usuario
            const user = await Users.findOne({ where: { name } });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verificar contraseña
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect password' });
            }

            // Generar token JWT
            const token = jwt.sign(
                { id: user.id, name: user.name, role: user.role, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({ message: 'Login successful', token, user: { name: user.name, role: user.role } });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
