export default async function handler(req, res) {
  try {
    authenticateToken(req, res, async () => {
      const { method } = req;

      console.log('Método recibido:', method);

      if (method === 'GET') {
        const { id: userId } = req.user;
        console.log('Usuario autenticado con ID:', userId);

        try {
          const files = await File.findAll({ where: { userId } });
          if (!files.length) {
            return res.status(404).json({ message: 'No se encontraron archivos.' });
          }

          return res.status(200).json(files.map(file => ({
            id: file.id,
            filename: file.filename,
            url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${file.filepath}`,
          })));
        } catch (error) {
          console.error('Error obteniendo archivos:', error);
          return res.status(500).json({ message: 'Error obteniendo archivos.' });
        }
      }

      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ message: `Método ${method} no permitido.` });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
}
