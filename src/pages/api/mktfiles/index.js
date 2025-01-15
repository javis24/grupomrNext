import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import File from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth';

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
        const form = formidable({
          keepExtensions: true,
          uploadDir: '/tmp', // Directorio temporal en Vercel
          maxFileSize: 10 * 1024 * 1024, // Tamaño máximo de archivo: 10 MB
        });

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
            // Verifica si el archivo existe antes de guardarlo en la base de datos
            const fileExists = await fs.stat(file.filepath).catch(() => null);
            if (!fileExists) {
              return res.status(400).json({ message: 'Archivo no válido o eliminado.' });
            }

            // Guarda los datos del archivo en la base de datos
            const newFile = await File.create({
              filename: file.originalFilename,
              filepath: file.filepath,
              userId,
            });

            return res.status(201).json({ message: 'Archivo subido correctamente', file: newFile });
          } catch (error) {
            console.error('Error saving file:', error);

            // Limpia el archivo temporal si ocurre un error
            await fs.unlink(file.filepath).catch((unlinkErr) => {
              console.error('Error deleting temporary file:', unlinkErr);
            });

            return res.status(500).json({ message: 'Error al guardar el archivo' });
          }
        });
        break;
      }

      case 'GET': {
        try {
          const files = await File.findAll({ where: { userId } });
          if (!files.length) {
            return res.status(404).json({ message: 'No se encontraron archivos.' });
          }

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
