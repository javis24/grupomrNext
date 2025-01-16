import transporter from '../../../lib/emailTransporter';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { emails, filePath, fileName, message } = req.body;

    // Validar los datos requeridos
    if (!emails || !emails.length) {
      return res.status(400).json({ message: 'No se han proporcionado correos electrónicos.' });
    }
    if (!filePath || !fileName) {
      return res.status(400).json({ message: 'No se ha proporcionado un archivo válido.' });
    }
    if (!message) {
      return res.status(400).json({ message: 'El mensaje del correo no puede estar vacío.' });
    }

    // Configura el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails, // lista de destinatarios
      subject: 'Envío de archivo',
      text: message,
      attachments: [
        {
          filename: fileName,
          path: `${process.env.NEXT_PUBLIC_BASE_URL || ''}${filePath}`, // URL del archivo
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Correo enviado exitosamente.' });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      res.status(500).json({ message: 'Hubo un error al enviar el correo.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Método ${req.method} no permitido.` });
  }
}
