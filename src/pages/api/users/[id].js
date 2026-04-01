import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  // IMPORTANTE: Agregar 'return' aquí para que Next.js espere la respuesta del middleware
  return authenticateToken(req, res, async () => {
    try {
      // 1. Verificar si el usuario existe antes de cualquier operación
      const user = await Users.findByPk(id);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      switch (method) {
        case 'GET':
          return res.status(200).json(user);

        case 'PUT':
          const { name, email, password, role } = req.body;

          if (!(name && email && role)) {
            return res.status(400).json({ message: 'Nombre, Email y Rol son requeridos' });
          }

          const updatedData = { name, email, role };

          // Solo hashear y añadir password si viene en el body
          if (password && password.trim() !== "") {
            updatedData.password = await bcrypt.hash(password, 10);
          }

          await user.update(updatedData);
          return res.status(200).json({ 
            message: 'Usuario actualizado con éxito', 
            user: { id: user.id, name: user.name, email: user.email, role: user.role } 
          });

        case 'DELETE':
          await user.destroy();
          return res.status(200).json({ message: 'Usuario eliminado correctamente' });

        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ message: `Método ${method} no permitido` });
      }
    } catch (error) {
      console.error(`Error en la operación ${method}:`, error);
      return res.status(500).json({ 
        message: 'Error interno del servidor', 
        error: error.message 
      });
    }
  });
}