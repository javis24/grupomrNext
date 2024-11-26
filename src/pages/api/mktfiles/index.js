import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import File from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false, // Desactiva bodyParser para manejar archivos
  },
};

export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    const { id: userId } = req.user;

    switch (method) {
      case 'POST': {
        const form = formidable({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error parsing file:', err);
            return res.status(500).json({ message: 'Error al procesar el archivo' });
          }

          const file = Array.isArray(files.file) ? files.file[0] : files.file;
          if (!file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
          }

          try {
            // Sube la imagen a Cloudinary
            const uploadResult = await cloudinary.uploader.upload(file.filepath, {
              folder: 'mktfiles',
            });

            // Guarda los datos del archivo en la base de datos
            const newFile = await File.create({
              filename: uploadResult.original_filename,
              filepath: uploadResult.secure_url,
              userId,
            });

            return res.status(201).json({ message: 'Archivo subido correctamente', file: newFile });
          } catch (error) {
            console.error('Error uploading file:', error);
            return res.status(500).json({ message: 'Error al guardar el archivo' });
          }
        });
        break;
      }

      case 'GET': {
        try {
          const files = await File.findAll({ where: { userId } });
          return res.status(200).json(files);
        } catch (error) {
          console.error('Error fetching files:', error);
          return res.status(500).json({ message: 'Error fetching files' });
        }
      }

      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ message: `Método ${method} no permitido` });
    }
  });
}
