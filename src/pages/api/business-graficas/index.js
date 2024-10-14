import BusinessUnitReport from '../../../models/BusinessUnitReport';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { reports } = req.body;

    try {
      // Obtener el token del encabezado de autorización
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
      }

      // Decodificar el token para obtener el userId
      const decoded = jwt.decode(token);
      const userId = decoded.id;

      // Verificar que el userId no sea null
      if (!userId) {
        return res.status(400).json({ message: 'No se pudo obtener el userId del token' });
      }

      // Iterar sobre los reportes e insertar en la base de datos con el userId
      for (const report of reports) {
        await BusinessUnitReport.create({
          name: report.name,
          total: report.total,
          createdAt: report.createdAt,
          userId: userId // Aquí se incluye el userId
        });
      }

      res.status(200).json({ message: 'Datos guardados exitosamente' });
    } catch (error) {
      console.error('Error guardando los reportes:', error);
      res.status(500).json({ message: 'Error al guardar los reportes' });
    }
        } else if (req.method === 'GET') {
            try {
            const reports = await BusinessUnitReport.findAll({
                attributes: ['name', 'createdAt'],  // Solo devuelve los campos que necesitas
                order: [['createdAt', 'DESC']]  // Ordenar por la fecha de creación
            });
            res.status(200).json(reports);
            } catch (error) {
            console.error('Error obteniendo los reportes:', error);
            res.status(500).json({ message: 'Error al obtener los reportes' });
            }
        } else {
            res.setHeader('Allow', ['POST', 'GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
        }
