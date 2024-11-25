import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import File from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const uploadDir = path.resolve('./public/uploads');

  // Verifica que el directorio de subida exista
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const { method } = req;

  // Autenticación del token
  await authenticateToken(req, res, async () => {
    const { role: userRole, id: userId } = req.user;
    if (!userId) {
      console.error('Token inválido o no proporcionado');
      return res.status(403).json({ message: 'Token inválido o no proporcionado' });
    }

    switch (method) {
      case 'POST': {
        const form = formidable({
          uploadDir, // Ruta absoluta para el directorio de subida
          keepExtensions: true,
        });

        // Manejo de subida de archivos
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error al procesar el archivo:', err);
            return res.status(500).json({ message: 'Error al procesar el archivo', details: err.message });
          }

          console.log('Archivos subidos:', files);

          const file = Array.isArray(files.file) ? files.file[0] : files.file;
          if (!file) {
            console.error('No se encontró ningún archivo en la solicitud');
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
          }

          const filename = file.originalFilename || file.newFilename;
          const filepath = path.join('/uploads', file.newFilename);

          try {
            // Guardar el archivo en la base de datos
            const newFile = await File.create({
              filename,
              filepath,
              userId,
            });

            console.log('Archivo guardado en la base de datos:', newFile);
            return res.status(201).json({ message: 'Archivo subido correctamente', file: newFile });
          } catch (error) {
            console.error('Error al guardar el archivo en la base de datos:', error);
            return res.status(500).json({ message: 'Error al guardar el archivo', details: error.message });
          }
        });

        // Se añade un return explícito para cerrar el ciclo del handler
        return;
      }

      case 'GET': {
        try {
          // Si el usuario es vendedor, mostrar solo sus archivos
          const files = userRole === 'vendedor'
            ? await File.findAll({ where: { userId } })
            : await File.findAll();

          console.log('Archivos obtenidos:', files);
          return res.status(200).json(files); // Respuesta explícita
        } catch (error) {
          console.error('Error al obtener archivos:', error);
          return res.status(500).json({ message: 'Error al obtener archivos', details: error.message });
        }
      }

      default:
        console.error(`Método ${method} no permitido`);
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
