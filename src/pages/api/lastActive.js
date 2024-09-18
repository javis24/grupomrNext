import Users from '../../models/UserModel';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];  // Extraer el token

    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar el token

    // Actualizar el campo lastActive
    await Users.update(
      { lastActive: new Date() }, 
      { where: { id: decoded.id } }
    );

    return res.status(200).json({ message: 'Last active actualizado' });

  } catch (error) {
    console.error('Error updating last active:', error);
    return res.status(500).json({ message: 'Error updating last active' });
  }
};
