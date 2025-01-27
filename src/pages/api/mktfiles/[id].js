// /api/mktfiles/[id].js
import { v2 as cloudinary } from 'cloudinary';
import File from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth';

// Configura Cloudinary (debes tener tus variables de entorno configuradas)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  const { id } = req.query;

  authenticateToken(req, res, async () => {
    const { method } = req;

    switch (method) {
      case 'DELETE': {
        try {
          // 1. Buscar el archivo en la base de datos
          const file = await File.findByPk(id);

          if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
          }

          // 2. Eliminar el archivo en Cloudinary (si tienes un campo publicId en tu modelo)
          if (file.publicId) {
            try {
              await cloudinary.uploader.destroy(file.publicId);
            } catch (cloudError) {
              console.error('Error eliminando archivo en Cloudinary:', cloudError);
              // Aquí decides si devuelves error o continúas. 
              // Podrías continuar para eliminarlo de la BD de todos modos.
            }
          }

          // 3. Eliminar el registro de la base de datos
          await file.destroy();

          return res.status(200).json({ message: 'Archivo eliminado con éxito' });
        } catch (error) {
          console.error('Error eliminando archivo:', error);
          return res.status(500).json({ message: 'Error eliminando el archivo' });
        }
      }

      default:
        res.setHeader('Allow', ['DELETE']);
        return res
          .status(405)
          .json({ message: `Método ${method} no permitido` });
    }
  });
}
