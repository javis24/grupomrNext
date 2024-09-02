import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    const { id } = req.query; // Obtener el ID del usuario de la URL

    if (req.method === 'GET') {
        authenticateToken(req, res, async () => {
            const user = await Users.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.json(user);
        });
    } else if (req.method === 'PUT') {
        authenticateToken(req, res, async () => {
            const { name, email, password, role } = req.body;

            if (!(name && email && password && role)) {
                return res.status(400).json({ message: "Todos los campos son necesarios" });
            }

            const hashedPassword = bcrypt.hashSync(password, 10); 
            const updatedUser = await Users.update({
                name, email, password: hashedPassword, role
            }, {
                where: { id }
            });

            if (updatedUser) {
                res.json({ message: "Usuario actualizado con éxito" });
            } else {
                res.status(404).json({ message: "Usuario no encontrado" });
            }
        });
    } else if (req.method === 'DELETE') {
        authenticateToken(req, res, async () => {
            const deleteUser = await Users.destroy({
                where: { id }
            });

            if (deleteUser) {
                res.json({ message: "Usuario eliminado con éxito" });
            } else {
                res.status(404).json({ message: "Usuario no encontrado" });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
