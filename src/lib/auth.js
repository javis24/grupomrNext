import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado, token faltante' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Error verificando token:', err);
      return res.status(403).json({ message: 'Token inválido' });
    }

    // Agregar el usuario decodificado al request
    req.user = user; 
    next(); // Continuar con el siguiente middleware o controlador
  });
}
