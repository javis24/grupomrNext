import Users from '../../models/UserModel'; // Importa tu modelo de usuarios
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, password } = req.body;  // Usamos name en lugar de email

        try {
            // Buscar al usuario por el name
            const user = await Users.findOne({ where: { name } });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verificar la contraseña
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect password' });
            }

            // Generar el token JWT con los datos del usuario
            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email, role: user.role },  // Incluye el name en el token
                process.env.JWT_SECRET,  // Asegúrate de que JWT_SECRET esté configurado en tus variables de entorno
                { expiresIn: '1h' }  // El token expirará en 1 hora
            );

            // Enviar el token al cliente
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
