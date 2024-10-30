import File from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  authenticateToken(req, res, async () => {
    const { method } = req;
    const { role: userRole, id: userId } = req.user;

    switch (method) {
      case 'PUT': {
        const { filename } = req.body;

        if (!filename) {
          return res.status(400).json({ message: 'El nombre del archivo es requerido' });
        }

        try {
          const file = await File.findByPk(id);

          if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
          }

          // Verificar permisos: los vendedores solo pueden actualizar archivos que ellos subieron
          if (userRole === 'vendedor' && file.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para actualizar este archivo' });
          }

          // Actualizar nombre del archivo
          file.filename = filename || file.filename;
          await file.save();

          return res.status(200).json({ message: 'Archivo actualizado con éxito', file });
        } catch (error) {
          console.error('Error updating file:', error);
          return res.status(500).json({ message: 'Error actualizando el archivo' });
        }
      }

      case 'DELETE': {
        try {
          const file = await File.findByPk(id);

          if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
          }

          // Verificar permisos: los vendedores solo pueden eliminar archivos que ellos subieron
          if (userRole === 'vendedor' && file.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este archivo' });
          }

          // Eliminar archivo
          await file.destroy();

          return res.status(200).json({ message: 'Archivo eliminado con éxito' });
        } catch (error) {
          console.error('Error eliminando archivo:', error);
          return res.status(500).json({ message: 'Error eliminando el archivo' });
        }
      }

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  });
}
