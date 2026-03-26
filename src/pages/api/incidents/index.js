import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import Incident from '../../../models/IncidentModel';
import jwt from 'jsonwebtoken';

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024,
      keepExtensions: true,
      multiples: false,
    });

    // Usamos una promesa para manejar el parseo de formidable en Next.js correctamente
    return new Promise((resolve) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          res.status(500).json({ message: 'Error al procesar el formulario' });
          return resolve();
        }

        try {
          // 1) Extraer todos los campos (incluyendo los nuevos)
          // Formidable a veces devuelve los campos como arrays, los normalizamos
          const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
          const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
          const incidentDate = Array.isArray(fields.incidentDate) ? fields.incidentDate[0] : fields.incidentDate;
          const entityName = Array.isArray(fields.entityName) ? fields.entityName[0] : fields.entityName;
          const correctivePlan = Array.isArray(fields.correctivePlan) ? fields.correctivePlan[0] : fields.correctivePlan;

          // 2) Obtener userId del Token
          const token = req.headers.authorization?.split(' ')[1];
          if (!token) {
            res.status(401).json({ message: 'Token no proporcionado' });
            return resolve();
          }
          const decoded = jwt.decode(token);
          const userId = decoded?.id;

          if (!userId) {
            res.status(400).json({ message: 'Usuario no identificado' });
            return resolve();
          }

          // 3) Manejo de imagen en Cloudinary
          let fileUploaded = files.image;
          if (Array.isArray(fileUploaded)) fileUploaded = fileUploaded[0];

          let imageUrl = '';
          if (fileUploaded && fileUploaded.filepath) {
            const uploadResult = await cloudinary.uploader.upload(fileUploaded.filepath, {
              folder: 'incidents_images',
              resource_type: 'auto',
            });
            imageUrl = uploadResult.secure_url;
          }

          // 4) Guardar en Base de Datos con los NUEVOS CAMPOS
          await Incident.create({
            title,
            description,
            incidentDate,    // Campo nuevo
            entityName,      // Campo nuevo
            correctivePlan,  // Campo nuevo
            userId,
            imageUrl,
          });

          res.status(200).json({ message: 'Incidencia guardada exitosamente' });
          resolve();
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error al guardar la incidencia' });
          resolve();
        }
      });
    });

  } else if (req.method === 'GET') {
    try {
      // Ordenamos por los más recientes
      const incidents = await Incident.findAll({ order: [['createdAt', 'DESC']] });
      return res.status(200).json(incidents);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener las incidencias' });
    }

  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      const incident = await Incident.findByPk(id);
      if (!incident) return res.status(404).json({ message: 'No encontrada' });
      
      await incident.destroy();
      return res.status(200).json({ message: 'Incidencia eliminada' });
    } catch (error) {
      return res.status(500).json({ message: 'Error al eliminar' });
    }
  }
}