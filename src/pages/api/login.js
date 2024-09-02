// src/pages/api/login.js
import Users from '../../models/UserModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { name, password } = req.body;

    try {
        console.log('Searching for user:', name);
        const user = await Users.findOne({ where: { name } });

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            console.log('Incorrect password');
            return res.status(401).json({ message: "Incorrect password" });
        }

        console.log('Generating token');
        const token = jwt.sign(
            { id: user.uuid, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful');
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
}
