import { useState } from 'react';
import axios from 'axios';

const SendMessageForm = () => {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Envía los datos al backend
      const res = await axios.post('/api/sendMessage', { to, message });
      setResponse(res.data);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setResponse({ success: false, message: 'Error enviando mensaje.' });
    }
  };

  return (
    <div>
      <h1>Enviar Mensaje por WhatsApp</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Número de Teléfono:</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Ejemplo: 5523456789 (sin código de país)"
            required
          />
        </div>
        <div>
          <label>Mensaje:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí"
            required
          ></textarea>
        </div>
        <button type="submit">Enviar</button>
      </form>
      {response && (
        <div>
          {response.success ? (
            <p>Mensaje enviado con éxito.</p>
          ) : (
            <p>Error: {response.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SendMessageForm;
