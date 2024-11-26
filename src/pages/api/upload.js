// pages/api/upload.js
import nextConnect from 'next-connect';
import multer from 'multer';
import cloudinary from '../../lib/cloudinary';

// Configurar multer para almacenar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single('image')); // 'image' es el nombre del campo

apiRoute.post(async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo.' });
    }

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'tu_carpeta_opcional' },
      (error, result) => {
        if (error) {
          throw new Error(error.message);
        }
        res.status(200).json({ url: result.secure_url, public_id: result.public_id });
      }
    );

    // Convertir buffer a stream
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);
    bufferStream.pipe(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Desactivar el bodyParser para usar multer
  },
};
