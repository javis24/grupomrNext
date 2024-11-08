import SalesReport from '../../../models/SalesReportModel';
import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Desactivamos el bodyParser para manejar la carga de archivos
  },
};

const handler = async (req, res) => {
  const { method } = req;

  // Autenticación del token y obtención de datos del usuario
  authenticateToken(req, res, async () => {
    const { email, id: userId } = req.user;

    try {
      if (method === 'POST') {
        // Manejar la carga de archivos y los datos del formulario
        const form = formidable({ multiples: true, uploadDir: './public/uploads', keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ message: 'Error processing form data' });
          }

          // Aseguramos que todos los campos sean cadenas
          const clienteProveedorProspecto = String(fields.clienteProveedorProspecto || '');
          const empresa = String(fields.empresa || '');
          const unidadNegocio = String(fields.unidadNegocio || '');
          const productoServicio = String(fields.productoServicio || '');
          const comentarios = String(fields.comentarios || '');
          const status = String(fields.status || '');
          const extraText = String(fields.extraText || '');

          if (!clienteProveedorProspecto || !empresa || !unidadNegocio || !productoServicio || !status || !extraText) {
            return res.status(400).json({ message: 'Required fields are missing' });
          }

          // Procesar la imagen
          let imageUrl = '';
          if (files.image) {
            imageUrl = `/uploads/${files.image.newFilename}`; // Almacena la URL de la imagen
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
          // Si el usuario es la coordinadora, puede ver todos los reportes
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
          // Si el usuario no es la coordinadora, solo puede ver sus propios reportes
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
