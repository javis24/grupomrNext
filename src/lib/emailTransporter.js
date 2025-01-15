import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE || 'smtp.gmail.com', // Default para Gmail
  port: parseInt(process.env.EMAIL_PORT, 10) || 465, // Puerto 465 para TLS
  secure: true, // Usar TLS
  auth: {
    user: process.env.EMAIL_USER, // Tu correo de Gmail
    pass: process.env.EMAIL_PASS, // Contraseña de aplicación
  },
});

export default transporter;
