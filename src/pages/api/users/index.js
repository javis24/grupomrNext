import db from '../../../config/Database.js';
import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Manejo de la autenticación y obtención de usuarios
        authenticateToken(req, res, async () => {
            try {
                const users = await Users.findAll();
                res.status(200).json(users); // Respuesta exitosa
            } catch (error) {
                console.error('Error fetching users:', error);
                res.status(500).json({ message: 'Error fetching users' }); // Error en la consulta
            }
        });
    } else if (req.method === 'POST') {
        authenticateToken(req, res, async () => {
            const { role: userRole } = req.user; // Extrae el rol del usuario autenticado
    
            // Verifica si el usuario tiene permiso para crear otros usuarios
            if (userRole !== 'admin' && userRole !== 'gerencia') {
                return res.status(403).json({ message: "No tienes permiso para crear usuarios" });
            }
    
            const { name, email, password, role } = req.body;
    
            // Log de los datos recibidos
            console.log('Datos recibidos:', { name, email, password, role });
    
            // Verificar si todos los campos requeridos están presentes
            if (!name || !email || !password || !role) {
                console.log('Faltan campos requeridos');
                return res.status(400).json({ message: "Todos los campos son necesarios" });
            }
    
            try {
                // Verificar si el usuario ya existe
                const oldUser = await Users.findOne({ where: { email } });
                if (oldUser) {
                    console.log('El usuario ya existe');
                    return res.status(409).json({ message: "El usuario ya existe" });
                }
    
                // Generar el hash de la contraseña
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt);
    
                // Crear el nuevo usuario
                const newUser = await Users.create({
                    name,
                    email,
                    password: hashedPassword,
                    role
                });
    
                console.log('Usuario creado con éxito:', newUser);
    
                // Respuesta exitosa con el nuevo usuario creado
                res.status(201).json({ message: "Usuario creado con éxito", user: newUser });
            } catch (error) {
                console.error('Error creando el usuario:', error);
                res.status(500).json({ message: error.message }); // Error durante la creación del usuario
            }
        });
    }
}