// /pages/api/incidents/index.js
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import Incident from '../../../models/IncidentModel';
import jwt from 'jsonwebtoken';

// Configura Cloudinary (o usa un archivo /lib/cloudinary.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Desactivar bodyParser para usar formidable
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // 1) Parsear con formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      keepExtensions: true,
      multiples: false, // solo una imagen
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ message: 'Error al procesar el formulario' });
      }

      try {
        // 2) Extraer campos de texto
        const { title, description } = fields;

        // 3) Obtener token y userId
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
          return res.status(401).json({ message: 'Token no proporcionado' });
        }
        const decoded = jwt.decode(token);
        const userId = decoded?.id;
        if (!userId) {
          return res.status(400).json({ message: 'No se pudo obtener el userId del token' });
        }

        // 4) Manejo del archivo subido (puede ser arreglo)
        let fileUploaded = files.image;
        if (Array.isArray(fileUploaded)) {
          fileUploaded = fileUploaded[0]; // Tomar el primer elemento
        }

        let imageUrl = null;
        if (fileUploaded) {
          // Subir a Cloudinary
          const uploadResult = await cloudinary.uploader.upload(fileUploaded.filepath, {
            folder: 'incidents_images',
            resource_type: 'auto', // 'auto' permite PDF, imágenes, etc.
          });
          imageUrl = uploadResult.secure_url;
        }

        // 5) Crear la incidencia en BD
        await Incident.create({
          title,
          description,
          userId,
          imageUrl, // será null si no se subió nada
        });

        return res.status(200).json({ message: 'Incidencia guardada exitosamente' });
      } catch (error) {
        console.error('Error al guardar la incidencia:', error);
        return res.status(500).json({ message: 'Error al guardar la incidencia' });
      }
    });

  } else if (req.method === 'GET') {
    // Listar incidencias
    try {
      const incidents = await Incident.findAll();
      return res.status(200).json(incidents);
    } catch (error) {
      console.error('Error al obtener las incidencias:', error);
      return res.status(500).json({ message: 'Error al obtener las incidencias' });
    }

  } else if (req.method === 'DELETE') {
    // Eliminar incidencia
    const { id } = req.query;
    try {
      if (!id) {
        return res.status(400).json({ message: 'ID no proporcionado' });
      }
      const incident = await Incident.findByPk(id);
      if (!incident) {
        return res.status(404).json({ message: 'Incidencia no encontrada' });
      }
      await incident.destroy();
      return res.status(200).json({ message: 'Incidencia eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar la incidencia:', error);
      return res.status(500).json({ message: 'Error al eliminar la incidencia' });
    }

  } else {
    // Método no permitido
    res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
