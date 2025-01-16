import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import File from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth'; // Importa correctamente aquí



export default async function handler(req, res) {
  const { id } = req.query;

  authenticateToken(req, res, async () => {
    const { method } = req;
    const { role: userRole, id: userId } = req.user;

    switch (method) {
      case 'PUT': {
        const { filename } = req.body;

        if (!filename) {
          return res.status(400).json({ message: 'El nombre del archivo es requerido' });
        }

        try {
          const file = await File.findByPk(id);
          if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
          }

          if (userRole === 'vendedor' && file.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para actualizar este archivo' });
          }

          file.filename = filename;
          await file.save();

          return res.status(200).json({ message: 'Archivo actualizado con éxito', file });
        } catch (error) {
          console.error('Error actualizando archivo:', error);
          return res.status(500).json({ message: 'Error actualizando archivo' });
        }
      }

      case 'DELETE': {
        try {
          const file = await File.findByPk(id);
          if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
          }

          const filePath = path.join(process.cwd(), 'public', file.filepath);
          try {
            await fs.unlink(filePath);
          } catch (err) {
            console.error('Error eliminando archivo físico:', err);
          }

          await file.destroy();
          return res.status(200).json({ message: 'Archivo eliminado con éxito' });
        } catch (error) {
          console.error('Error eliminando archivo:', error);
          return res.status(500).json({ message: 'Error eliminando archivo' });
        }
      }

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ message: `Método ${method} no permitido` });
    }
  });
}
