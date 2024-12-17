import client from '../../../components/whatsappClient'; // Importa usando export default

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let { to, message } = req.body;

    // Validar que se proporcionen los datos necesarios
    if (!to || !message) {
      return res.status(400).json({ success: false, message: 'Número y mensaje son obligatorios.' });
    }

    // Asegúrate de que el número tiene el prefijo de país
    if (!to.startsWith('52')) {
      to = `52${to}`;
    }

    try {
      const chatId = `${to}@c.us`; // Formato requerido por WhatsApp
      await client.sendMessage(chatId, message);
      res.status(200).json({ success: true, message: 'Mensaje enviado con éxito.' });
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      res.status(500).json({ success: false, message: 'Error al enviar el mensaje.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Método no permitido.' });
  }
}
