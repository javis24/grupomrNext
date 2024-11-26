// pages/api/mktfiles/[id].js
import File from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth';
import cloudinary from '../../../lib/cloudinary';
import url from 'url';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  await authenticateToken(req, res, async () => {
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

          if (userRole === 'vendedor' && file.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para actualizar este archivo' });
          }

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

          if (userRole === 'vendedor' && file.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este archivo' });
          }

          // Extraer la Public ID de Cloudinary desde la URL
          const parsedUrl = url.parse(file.filepath);
          const pathname = parsedUrl.pathname; // /<folder>/<public_id>.<extension>
          const parts = pathname.split('/');
          const fileWithExt = parts[parts.length - 1]; // <public_id>.<extension>
          const publicId = `uploads/${fileWithExt.split('.').slice(0, -1).join('.')}`; // uploads/<public_id>

          // Eliminar de Cloudinary
          await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });

          // Eliminar de la base de datos
          await file.destroy();

          return res.status(200).json({ message: 'Archivo eliminado con éxito' });
        } catch (error) {
          console.error('Error eliminando archivo:', error);
          return res.status(500).json({ message: 'Error eliminando el archivo', details: error.message });
        }
      }

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ message: `Método ${method} no permitido` });
    }
  });
}
