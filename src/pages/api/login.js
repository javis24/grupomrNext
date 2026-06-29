// pages/api/login.js
import Users from '../../models/UserModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({
            message: 'Nombre y contraseña son requeridos',
        });
    }

    try {
        const user = await Users.findOne({
            where: { name },
        });

        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado',
            });
        }

        // IMPORTANTE:
        // Si el usuario fue dado de baja, ya no puede iniciar sesión.
        if (user.isActive === false) {
            return res.status(403).json({
                message: 'Este usuario fue dado de baja. Contacta al administrador.',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Contraseña incorrecta',
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
                isActive: user.isActive,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: 'Inicio de sesión correcto',
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
                isActive: user.isActive,
            },
        });

    } catch (error) {
        console.error('Error logging in:', error);

        return res.status(500).json({
            message: 'Error del servidor',
            error: error.message,
        });
    }
}