import { del } from '@vercel/blob';
import File from '../../../models/FilesModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  return authenticateToken(req, res, async () => {
    const { method } = req;
    const { role: userRole, id: userId } = req.user;

    try {
      const file = await File.findByPk(id);

      if (!file) {
        return res.status(404).json({
          message: 'Archivo no encontrado',
        });
      }

      if (userRole === 'vendedor' && file.userId !== userId) {
        return res.status(403).json({
          message: 'No tienes permiso para modificar este archivo',
        });
      }

      if (method === 'PUT') {
        const { filename } = req.body;

        if (!filename) {
          return res.status(400).json({
            message: 'El nombre del archivo es requerido',
          });
        }

        await file.update({ filename });

        return res.status(200).json({
          message: 'Archivo actualizado con éxito',
          file,
        });
      }

      if (method === 'DELETE') {
        try {
          if (file.filepath?.includes('blob.vercel-storage.com')) {
            await del(file.filepath);
          }
        } catch (blobError) {
          console.error('Error eliminando archivo en Blob:', blobError);
        }

        await file.destroy();

        return res.status(200).json({
          message: 'Archivo eliminado con éxito',
        });
      }

      res.setHeader('Allow', ['PUT', 'DELETE']);

      return res.status(405).json({
        message: `Método ${method} no permitido`,
      });
    } catch (error) {
      console.error('ERROR API FILES [ID]:', error);

      return res.status(500).json({
        message: 'Error interno',
        error: error.message,
      });
    }
  });
}