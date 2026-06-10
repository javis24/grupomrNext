import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { put } from '@vercel/blob';
import File from '../../../models/FilesModel';
import { authenticateToken } from '../../../lib/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

const sanitizeFilename = (filename = 'documento.pdf') => {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
};

export default async function handler(req, res) {
  const { method } = req;

  return authenticateToken(req, res, async () => {
    const { role: userRole, id: userId } = req.user;

    try {
      if (method === 'GET') {
        const files =
          userRole === 'vendedor'
            ? await File.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']],
              })
            : await File.findAll({
                order: [['createdAt', 'DESC']],
              });

        return res.status(200).json(files);
      }

      if (method === 'POST') {
        const form = formidable({
          uploadDir: os.tmpdir(),
          keepExtensions: true,
          multiples: false,
          maxFileSize: 10 * 1024 * 1024,
          filter: ({ mimetype }) => mimetype === 'application/pdf',
        });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error parsing file:', err);
            return res.status(500).json({
              message: 'Error al procesar el archivo',
              error: err.message,
            });
          }

          const uploadedFile = Array.isArray(files.file)
            ? files.file[0]
            : files.file;

          if (!uploadedFile) {
            return res.status(400).json({
              message: 'No se ha subido ningún archivo PDF',
            });
          }

          try {
            const originalName =
              uploadedFile.originalFilename ||
              uploadedFile.newFilename ||
              'documento.pdf';

            const safeOriginalName = sanitizeFilename(originalName);
            const blobPath = `pdfs/${userId}/${Date.now()}-${safeOriginalName}`;

            const fileBuffer = fs.readFileSync(uploadedFile.filepath);

            const blob = await put(blobPath, fileBuffer, {
              access: 'public',
              contentType: uploadedFile.mimetype || 'application/pdf',
              addRandomSuffix: false,
            });

            const newFile = await File.create({
              filename: originalName,
              filepath: blob.url,
              userId,
            });

            return res.status(201).json({
              message: 'Archivo subido correctamente',
              file: newFile,
            });
          } catch (error) {
            console.error('Error subiendo a Vercel Blob:', error);

            return res.status(500).json({
              message: 'Error al guardar el archivo en Vercel Blob',
              error: error.message,
            });
          }
        });

        return;
      }

      res.setHeader('Allow', ['GET', 'POST']);

      return res.status(405).json({
        message: `Método ${method} no permitido`,
      });
    } catch (error) {
      console.error('ERROR API FILES:', error);

      return res.status(500).json({
        message: 'Error interno en archivos',
        error: error.message,
      });
    }
  });
}