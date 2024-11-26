import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import MktFileModel from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth';

// Configuración para deshabilitar bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  const { method } = req;

  // Autenticación del token
  await authenticateToken(req, res, async () => {
    const { id: userId } = req.user;

    switch (method) {
      case 'POST': {
        const uploadDir = path.join(process.cwd(), '/public/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
          uploadDir, // Directorio de carga
          keepExtensions: true, // Mantener extensión del archivo
          maxFileSize: 8 * 1024 * 1024, // Tamaño máximo: 8 MB
          allowEmptyFiles: false, // No permitir archivos vacíos
          filter: ({ mimetype }) => mimetype && mimetype.startsWith('image/'), // Solo permitir imágenes
        });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error al procesar el formulario:', err);
            return res.status(500).json({ message: 'Error processing form data' });
          }
          console.log('Archivos recibidos en producción:', files);
        
          // Asegúrate de que `files.image` existe y tiene `filepath`
          if (!files.image || !files.image[0]?.filepath) {
            console.error('Archivo no encontrado o filepath no definido.');
            return res.status(400).json({ message: 'Archivo no encontrado o filepath no definido.' });
          }
        
          const imageUrl = `/uploads/${files.image[0].newFilename}`;
          console.log('URL del archivo:', imageUrl);
        
          // Inserción en la base de datos
          try {
            const newFile = await MktFileModel.create({
              filename: files.image[0].originalFilename,
              filepath: imageUrl,
              userId,
            });
            console.log('Archivo guardado en la base de datos:', newFile);
            return res.status(201).json({ message: 'Archivo subido exitosamente', file: newFile });
          } catch (dbError) {
            console.error('Error al guardar el archivo en la base de datos:', dbError);
            return res.status(500).json({ message: 'Error al guardar el archivo', error: dbError.message });
          }
        });        
        break;
      }

      case 'GET': {
        try {
          const files = await MktFileModel.findAll();
          return res.status(200).json(files);
        } catch (error) {
          console.error('Error al obtener los archivos:', error);
          return res.status(500).json({ message: 'Error al obtener los archivos' });
        }
      }

      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ message: `Método ${method} no permitido` });
    }
  });
};

export default handler;
