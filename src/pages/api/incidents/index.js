import Incident from '../../../models/IncidentModel';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, description } = req.body;

    try {
      // Obtener el token del encabezado de autorización
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
      }

      // Decodificar el token para obtener el userId
      const decoded = jwt.decode(token);
      const userId = decoded.id;

      if (!userId) {
        return res.status(400).json({ message: 'No se pudo obtener el userId del token' });
      }

      // Crear la incidencia
      await Incident.create({
        title,
        description,
        userId, // Relacionar con el usuario que creó la incidencia
      });

      res.status(200).json({ message: 'Incidencia guardada exitosamente' });
    } catch (error) {
      console.error('Error al guardar la incidencia:', error);
      res.status(500).json({ message: 'Error al guardar la incidencia' });
    }
  } else if (req.method === 'GET') {
    try {
      const incidents = await Incident.findAll();
      res.status(200).json(incidents);
    } catch (error) {
      console.error('Error al obtener las incidencias:', error);
      res.status(500).json({ message: 'Error al obtener las incidencias' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      // Validar que se pase el ID
      if (!id) {
        return res.status(400).json({ message: 'ID no proporcionado' });
      }

      // Buscar y eliminar la incidencia por ID
      const incident = await Incident.findByPk(id);
      if (!incident) {
        return res.status(404).json({ message: 'Incidencia no encontrada' });
      }

      await incident.destroy();
      res.status(200).json({ message: 'Incidencia eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar la incidencia:', error);
      res.status(500).json({ message: 'Error al eliminar la incidencia' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
