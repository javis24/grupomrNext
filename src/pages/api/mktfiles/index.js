// /api/mktfiles/index.js
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import File from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Para que Next.js no intente parsear el body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  // Verificamos token antes de procesar
  return authenticateToken(req, res, async () => {
    switch (method) {
      case 'POST': {
        // 1. Crear instancia de formidable (sin "new IncomingForm")
        const form = formidable({
          maxFileSize: 10 * 1024 * 1024, // 10 MB
          keepExtensions: true,
        });

        // 2. Parsear la request
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error parsing file:', err);
            return res
              .status(500)
              .json({ message: 'Error al procesar el archivo' });
          }

          // 3. Tomar el archivo subido (podría venir como files.file o similar)
          const fileUploaded = Array.isArray(files.file)
            ? files.file[0]
            : files.file;

          if (!fileUploaded) {
            return res
              .status(400)
              .json({ message: 'No se subió ningún archivo válido.' });
          }

          try {
            // 4. Subir a Cloudinary
            const uploadResult = await cloudinary.uploader.upload(
              fileUploaded.filepath, 
              {
                folder: 'mis_pdfs',
                resource_type: 'auto', // para pdf, imágenes, etc.
              }
            );

            // 5. Guardar en la base de datos
            //    Asumiendo que guardas filepath con `uploadResult.secure_url`
            const newFile = await File.create({
              filename: uploadResult.original_filename,
              originalFilename: fileUploaded.originalFilename,
              filepath: uploadResult.secure_url,
              userId: req.user.id, // si lo necesitas
            });

            return res.status(201).json({
              message: 'Archivo subido correctamente a Cloudinary',
              file: newFile,
            });
          } catch (uploadError) {
            console.error('Error subiendo a Cloudinary:', uploadError);
            return res.status(500).json({
              message: 'Error al subir el archivo a Cloudinary',
            });
          }
        });
        break;
      }

      case 'GET': {
        try {
          const files = await File.findAll({ where: { userId: req.user.id } });
          return res.status(200).json(files || []);
        } catch (error) {
          console.error('Error fetching files:', error);
          return res.status(500).json({ message: 'Error fetching files' });
        }
      }

      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({
          message: `Método ${method} no permitido`,
        });
    }
  });
}
