// pages/api/email/send-file-email.js
import transporter from '../../../lib/emailTransporter';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { emails, fileUrl, fileName, message } = req.body;

    // Validar los datos de entrada
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Se requiere al menos un destinatario.' });
    }
    if (!fileUrl || !fileName) {
      return res.status(400).json({ message: 'El archivo y su nombre son requeridos.' });
    }

    // Configura el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails.join(', '), // Convertir array en una lista separada por comas
      subject: 'Envío de archivo',
      text: message || 'Adjunto encontrarás el archivo solicitado.',
      attachments: [
        {
          filename: fileName,
          path: fileUrl, // Ruta absoluta o relativa al archivo
        },
      ],
    };

    try {
      // Enviar el correo
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'Correo enviado exitosamente' });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({
        message: 'Hubo un error al enviar el correo.',
        error: error.message, // Incluye detalles del error para depuración
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Método no permitido' });
  }
}
