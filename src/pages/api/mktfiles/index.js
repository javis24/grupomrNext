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
        const uploadDir = path.join(process.cwd(), 'public/uploads'); // Carpeta donde se guardarán los archivos
        
        const form = formidable({
          keepExtensions: true,
          uploadDir,
          maxFileSize: 10 * 1024 * 1024, // Tamaño máximo del archivo: 10 MB
          filename: (name, ext, part) => {
            // Generar un nombre único para evitar colisiones
            const uniqueName = `${Date.now()}-${part.originalFilename.replace(/\s+/g, '_')}`;
            return uniqueName;
          },
        });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error parsing file:', err);
            return res.status(500).json({ message: 'Error al procesar el archivo' });
          }

          const file = Array.isArray(files.file) ? files.file[0] : files.file;

          if (!file || !file.filepath) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo válido.' });
          }

          try {
            const uniqueFilename = path.basename(file.filepath); // Nombre único del archivo
            const publicUrl = `/uploads/${uniqueFilename}`; // Genera la URL pública

            // Guarda el archivo en la base de datos
            const newFile = await File.create({
              filename: uniqueFilename, // Guardamos el nombre único generado
              originalFilename: file.originalFilename, // Guardamos el nombre original para referencia
              filepath: publicUrl, // Guarda la URL pública
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

          // Devuelve la lista de archivos con la URL completa
          return res.status(200).json(files.map((file) => ({
            id: file.id,
            filename: file.filename,
            url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.grupomrlaguna.com/'}${file.filepath}`, // Genera URL completa
            createdAt: file.createdAt,
          })));
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
