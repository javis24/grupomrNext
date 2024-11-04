import BusinessUnitReport from '../../../models/BusinessUnitReport';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method === 'DELETE') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
      }

      const decoded = jwt.decode(token);
      const userId = decoded.id;

      const report = await BusinessUnitReport.findOne({
        where: { id, userId },
      });

      if (!report) {
        return res.status(404).json({ message: 'Archivo no encontrado o no autorizado' });
      }

      await report.destroy();
      return res.status(200).json({ message: 'Archivo eliminado correctamente' });
    } catch (error) {
      console.error('Error eliminando el archivo:', error);
      return res.status(500).json({ message: 'Error al eliminar el archivo' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
