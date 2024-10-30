// pages/api/send-file-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { emails, fileUrl, fileName, message } = req.body;

  try {
    // Configura el transporter de Nodemailer con los datos de Hostinger
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVICE,
      port: process.env.EMAIL_PORT,
      secure: true, // usa SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configuración del contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails, // Lista de correos para envío múltiple
      subject: `Envío de archivo: ${fileName}`,
      text: message || `Aquí tienes el archivo adjunto: ${fileName}`,
      attachments: [
        {
          filename: fileName,
          path: fileUrl,
        },
      ],
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado exitosamente' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'Hubo un problema al enviar el correo' });
  }
}
