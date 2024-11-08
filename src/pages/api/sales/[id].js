import SalesReport from '../../../models/SalesReportModel';
import { authenticateToken } from '../../../lib/auth';
import Users from '../../../models/UserModel';
import formidable from 'formidable';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  const { id } = req.query;

  if (req.method === 'PUT') {
    await authenticateToken(req, res, async () => {
      const { role: userRole, id: userId } = req.user;

      const form = new formidable.IncomingForm();
      form.uploadDir = './public/uploads';
      form.keepExtensions = true;
      
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          return res.status(500).json({ message: 'Error processing upload' });
        }

        const {
          clienteProveedorProspecto,
          empresa,
          unidadNegocio,
          productoServicio,
          comentarios,
          status,
          extraText,
        } = fields;

        try {
          const report = await SalesReport.findByPk(id, {
            include: [
              {
                model: Users,
                attributes: ['name'],
              },
            ],
          });

          if (!report) {
            return res.status(404).json({ message: 'Sales report not found' });
          }

          if (userRole === 'vendedor' && report.userId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to update this report' });
          }

          // Procesar la imagen, si se subió una nueva
          let imageUrl = report.imageUrl;
          if (files.image) {
            const filePath = path.join('/uploads', path.basename(files.image.filepath));
            imageUrl = filePath;
          }

          // Actualizar reporte
          report.clienteProveedorProspecto = clienteProveedorProspecto || report.clienteProveedorProspecto;
          report.empresa = empresa || report.empresa;
          report.unidadNegocio = unidadNegocio || report.unidadNegocio;
          report.productoServicio = productoServicio || report.productoServicio;
          report.comentarios = comentarios || report.comentarios;
          report.status = status || report.status;
          report.extraText = extraText || report.extraText;
          report.imageUrl = imageUrl; // Actualizar la URL de la imagen si se subió una nueva

          await report.save();

          return res.status(200).json({ message: "Sales report updated successfully", report });
        } catch (error) {
          console.error('Error updating report:', error);
          return res.status(500).json({ message: 'Error updating report' });
        }
      });
    });
  } else if (req.method === 'DELETE') {
    authenticateToken(req, res, async () => {
      const { role: userRole, id: userId } = req.user;

      try {
        const report = await SalesReport.findByPk(id);
        if (!report) {
          return res.status(404).json({ message: 'Sales report not found' });
        }

        if (userRole === 'vendedor' && report.userId !== userId) {
          return res.status(403).json({ message: 'You do not have permission to delete this report' });
        }

        await report.destroy();

        return res.status(200).json({ message: 'Sales report deleted successfully' });
      } catch (error) {
        console.error('Error deleting report:', error);
        return res.status(500).json({ message: 'Error deleting report' });
      }
    });
  } else {
    return res.setHeader('Allow', ['PUT', 'DELETE']).status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
