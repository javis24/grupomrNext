export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    const { id: userId } = req.user;

    const uploadDir = path.join(process.cwd(), 'public/uploads');

    // Verificar si el directorio existe
    await fs.mkdir(uploadDir, { recursive: true }).catch((err) => {
      console.error('Error al crear el directorio de carga:', err);
    });

    switch (method) {
      case 'POST': {
        const form = formidable({
          keepExtensions: true,
          uploadDir,
          maxFileSize: 10 * 1024 * 1024, // 10 MB
          filename: (name, ext, part) => `${Date.now()}-${part.originalFilename.replace(/\s+/g, '_')}`,
        });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error al procesar el archivo:', err);
            return res.status(500).json({ message: 'Error al procesar el archivo' });
          }

          const file = Array.isArray(files.file) ? files.file[0] : files.file;

          if (!file || !file.filepath) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo válido.' });
          }

          try {
            const uniqueFilename = path.basename(file.filepath);
            const publicUrl = `/uploads/${uniqueFilename}`;

            const newFile = await File.create({
              filename: uniqueFilename,
              originalFilename: file.originalFilename,
              filepath: publicUrl,
              userId,
            });

            return res.status(201).json({ message: 'Archivo subido correctamente', file: newFile });
          } catch (error) {
            console.error('Error al guardar el archivo:', error);
            await fs.unlink(file.filepath).catch((unlinkErr) => {
              console.error('Error al eliminar el archivo temporal:', unlinkErr);
            });
            return res.status(500).json({ message: 'Error al guardar el archivo' });
          }
        });
        break;
      }

      case 'GET': {
        try {
          const files = await File.findAll({ where: { userId } });
          if (!files.length) {
            return res.status(404).json({ message: 'No se encontraron archivos.' });
          }

          return res.status(200).json(
            files.map((file) => ({
              id: file.id,
              filename: file.filename,
              url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${file.filepath}`,
              createdAt: file.createdAt,
            }))
          );
        } catch (error) {
          console.error('Error al obtener archivos:', error);
          return res.status(500).json({ message: 'Error al obtener archivos' });
        }
      }

      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ message: `Método ${method} no permitido` });
    }
  });
}
