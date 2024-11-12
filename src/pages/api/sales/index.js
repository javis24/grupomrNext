import SalesReport from '../../../models/SalesReportModel';
import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';
import fs from 'fs';
import path from 'path';

const formidable = require('formidable'); // Asegúrate de usar require en lugar de import

export const config = {
  api: {
    bodyParser: false, // Necesario para manejar archivos
  },
};

const handler = async (req, res) => {
  const { method } = req;

  // Autenticación del token y obtención de datos del usuario
  authenticateToken(req, res, async () => {
    const { email, id: userId } = req.user;

    try {
      if (method === 'POST') {
        // Configuración de formidable
        const form = new formidable.IncomingForm({
          uploadDir: path.join(process.cwd(), '/public/uploads'),
          keepExtensions: true,
          maxFileSize: 2 * 1024 * 1024, // Tamaño máximo de archivo
        });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ message: 'Error processing form data' });
          }

          // Procesar la imagen
          let imageUrl = '';
          if (files.image && Array.isArray(files.image) && files.image.length > 0) {
            imageUrl = `/uploads/${files.image[0].newFilename}`;
          } else {
            console.warn('No image provided in the request.');
          }

          const clienteProveedorProspecto = String(fields.clienteProveedorProspecto || '');
          const empresa = String(fields.empresa || '');
          const unidadNegocio = String(fields.unidadNegocio || '');
          const productoServicio = String(fields.productoServicio || '');
          const comentarios = String(fields.comentarios || '');
          const status = String(fields.status || '');
          const extraText = String(fields.extraText || '');

          if (!clienteProveedorProspecto || !empresa || !unidadNegocio || !productoServicio || !status) {
            return res.status(400).json({ message: 'Required fields are missing' });
          }

          try {
            const newReport = await SalesReport.create({
              clienteProveedorProspecto,
              empresa,
              unidadNegocio,
              productoServicio,
              comentarios,
              status,
              extraText,
              imageUrl,
              userId,
            });

            return res.status(201).json({ message: 'Sales report created successfully', report: newReport });
          } catch (createError) {
            console.error('Error creating sales report:', createError);
            return res.status(500).json({ message: 'Error creating sales report', error: createError.message });
          }
        });
      } else if (method === 'GET') {
        let reports;

        if (email === 'coordinadora@grupomrlaguna.com') {
          reports = await SalesReport.findAll({
            include: [
              {
                model: Users,
                as: 'User',
                attributes: ['name'],
              },
            ],
          });
        } else {
          reports = await SalesReport.findAll({
            where: { userId },
            include: [
              {
                model: Users,
                as: 'User',
                attributes: ['name'],
              },
            ],
          });
        }

        return res.status(200).json(reports);
      } else {
        return res.setHeader('Allow', ['GET', 'POST']).status(405).json({ message: `Method ${method} Not Allowed` });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};

export default handler;
