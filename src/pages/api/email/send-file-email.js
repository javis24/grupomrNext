// pages/api/email/send-file-email.js
import transporter from '../../../lib/emailTransporter';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { emails, fileUrl, fileName, message } = req.body;

    // Configura el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails, // lista de destinatarios
      subject: 'Envío de archivo',
      text: message,
      attachments: [
        {
          filename: fileName,
          path: `${process.env.NEXT_PUBLIC_BASE_URL}${fileUrl}`,
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Correo enviado exitosamente' });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      res.status(500).json({ message: 'Hubo un error al enviar el correo' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
