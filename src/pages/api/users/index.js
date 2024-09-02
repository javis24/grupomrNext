import db from '../../../config/Database.js';
import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        authenticateToken(req, res, async () => {
            const users = await Users.findAll();
            res.json(users);
        });
    } else if (req.method === 'POST') {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Todos los campos son necesarios" });
        }

        try {
            const oldUser = await Users.findOne({ where: { email } });
            if (oldUser) {
                return res.status(409).json({ message: "El usuario ya existe" });
            }

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            const newUser = await Users.create({
                name,
                email,
                password: hashedPassword,
                role
            });

            res.status(201).json({ message: "Usuario creado con éxito", user: newUser });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
