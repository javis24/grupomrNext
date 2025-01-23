import fs from 'fs/promises';
import path from 'path';
import File from '../../../models/MktFileModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  authenticateToken(req, res, async () => {
    const { method } = req;
    const { role: userRole, id: userId } = req.user;

    switch (method) {
      case 'DELETE': {
        try {
          const file = await File.findByPk(id);

          if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
          }

          // Construir la ruta absoluta del archivo físico
          const absoluteFilePath = path.join(process.cwd(), 'public', 'uploads', file.filename);

          // Eliminar el archivo del sistema de archivos
          try {
            await fs.unlink(absoluteFilePath);
            console.log(`Archivo eliminado: ${absoluteFilePath}`);
          } catch (err) {
            console.error('Error eliminando archivo físico:', err);
          }

          // Eliminar el registro de la base de datos
          await file.destroy();

          return res.status(200).json({ message: 'Archivo eliminado con éxito' });
        } catch (error) {
          console.error('Error eliminando archivo:', error);
          return res.status(500).json({ message: 'Error eliminando el archivo' });
        }
      }

      default:
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ message: `Método ${method} no permitido` });
    }
  });
}
