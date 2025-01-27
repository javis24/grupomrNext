// /api/email/send-file-email.js
import transporter from '../../../lib/emailTransporter';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { emails, filePath, fileName, message } = req.body;

    // Validar datos
    if (!emails || !emails.length) {
      return res
        .status(400)
        .json({ message: 'No se han proporcionado correos electrónicos.' });
    }
    if (!filePath || !fileName) {
      return res
        .status(400)
        .json({ message: 'No se ha proporcionado un archivo válido.' });
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emails, // Lista de destinatarios
        subject: 'Envío de archivo',
        text: message || 'Hola, te envío el archivo adjunto.',
        // Aquí sí pones attachments
        attachments: [
          {
            filename: fileName,      // Nombre deseado en el correo 
            contentType: 'image/jpeg',  // Ajusta al tipo MIME adecuado (image/png, application/pdf, etc.)
            path: filePath,          // Tu URL de Cloudinary o ruta local
          },
        ],
      });

      return res.status(200).json({ message: 'Correo enviado exitosamente.' });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ message: 'Hubo un error al enviar el correo.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res
      .status(405)
      .json({ message: `Método ${req.method} no permitido.` });
  }
}
