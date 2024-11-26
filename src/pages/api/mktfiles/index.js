// pages/api/mktfiles/index.js
import { IncomingForm } from 'formidable'; // Importación nombrada
import { authenticateToken } from '../../../lib/auth';
import File from '../../../models/MktFileModel';
import cloudinary from '../../../lib/cloudinary';
import { v4 as uuidv4 } from 'uuid'; // Asegúrate de tener instalada la librería 'uuid'

// Configuración para deshabilitar el bodyParser y permitir la subida de archivos
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  await authenticateToken(req, res, async () => {
    const { role: userRole, id: userId } = req.user;

    if (!userId) {
      console.error('Token inválido o no proporcionado');
      return res.status(403).json({ message: 'Token inválido o no proporcionado' });
    }

    switch (method) {
      case 'POST': {
        const form = new IncomingForm(); // Uso correcto de IncomingForm
        form.keepExtensions = true;

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error al procesar el archivo:', err);
            return res.status(500).json({ message: 'Error al procesar el archivo', details: err.message });
          }

          const file = Array.isArray(files.file) ? files.file[0] : files.file;
          if (!file) {
            console.error('No se encontró ningún archivo en la solicitud');
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
          }

          try {
            // Subir el archivo a Cloudinary
            const uploadResult = await cloudinary.uploader.upload(file.filepath, {
              folder: 'uploads', // Opcional: carpeta en Cloudinary
              resource_type: 'auto', // Detecta automáticamente el tipo de archivo
            });

            // Guardar en la base de datos
            const newFile = await File.create({
              filename: file.originalFilename,
              filepath: uploadResult.secure_url, // URL de Cloudinary
              userId,
            });

            console.log('Archivo subido y guardado en la base de datos:', newFile);
            return res.status(201).json({ message: 'Archivo subido correctamente', file: newFile });
          } catch (error) {
            console.error('Error al subir a Cloudinary o guardar en la base de datos:', error);
            return res.status(500).json({ message: 'Error al subir el archivo', details: error.message });
          }
        });

        return;
      }

      case 'GET': {
        try {
          const files = userRole === 'vendedor'
            ? await File.findAll({ where: { userId } })
            : await File.findAll();

          console.log('Archivos obtenidos:', files);
          return res.status(200).json(files);
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
