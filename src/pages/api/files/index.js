import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import File from '../../../models/FilesModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const uploadDir = path.resolve('./public/uploads');
  
  // Verifica que el directorio de subida exista
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const { method } = req;

  authenticateToken(req, res, async () => {
    const { role: userRole, id: userId } = req.user;

    switch (method) {
      case 'POST': {
        const form = formidable({
          uploadDir, // Usa la ruta absoluta para el directorio de subida
          keepExtensions: true,
        });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error parsing file:', err);
            return res.status(500).json({ message: 'Error al procesar el archivo' });
          }

          // Accede al archivo dentro del array
          const file = Array.isArray(files.file) ? files.file[0] : files.file;
          if (!file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
          }

          const filename = file.originalFilename || file.newFilename;
          const filepath = path.join('/uploads', file.newFilename);

          try {
            const newFile = await File.create({
              filename,
              filepath,
              userId,
            });

            return res.status(201).json({ message: 'Archivo subido correctamente', file: newFile });
          } catch (error) {
            console.error('Error saving file:', error);
            return res.status(500).json({ message: 'Error al guardar el archivo' });
          }
        });
        break;
      }

      case 'GET': {
        try {
          // Si el usuario es vendedor, mostrar solo sus archivos
          const files = userRole === 'vendedor'
            ? await File.findAll({ where: { userId } })
            : await File.findAll();

          return res.status(200).json(files);
        } catch (error) {
          console.error('Error fetching files:', error);
          return res.status(500).json({ message: 'Error fetching files' });
        }
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Método ${method} no permitido` });
    }
  });
}

// Config para el manejo de archivos sin bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};
