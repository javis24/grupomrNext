'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ChatComponent = () => {
  const [clients, setClients] = useState([]); // Lista de clientes
  const [selectedClient, setSelectedClient] = useState(''); // Teléfono del cliente seleccionado
  const [message, setMessage] = useState(''); // Mensaje del chat
  const [response, setResponse] = useState(null); // Respuesta de la API al enviar mensaje

  // Cargar clientes desde la API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get('/api/clients');
        setClients(res.data); // Suponiendo que la API devuelve un array de clientes
      } catch (error) {
        console.error('Error al obtener los clientes:', error);
      }
    };
    fetchClients();
  }, []);

  // Manejar el envío del mensaje
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient || !message) {
      setResponse({ success: false, message: 'Selecciona un cliente y escribe un mensaje.' });
      return;
    }
    try {
      const res = await axios.post('/api/sendMessage', {
        to: selectedClient,
        message,
      });
      setResponse(res.data);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setResponse({ success: false, message: 'Error al enviar el mensaje.' });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-5 p-5 bg-white shadow-lg rounded">
      <h1 className="text-2xl font-bold mb-4">Chat de Clientes</h1>

      {/* Formulario de Selección y Envío */}
      <form onSubmit={handleSubmit}>
        {/* Lista de Clientes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Selecciona un Cliente:</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full p-2 border rounded text-black"
          >
            <option value="">-- Selecciona --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.contactPhone}>
                {client.fullName} - {client.contactPhone}
              </option>
            ))}
          </select>
        </div>

        {/* Campo del Mensaje */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Mensaje:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="w-full p-2 border rounded"
            rows="3"
            required
          ></textarea>
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Enviar Mensaje
        </button>
      </form>

      {/* Respuesta */}
      {response && (
        <div className={`mt-4 p-3 ${response.success ? 'bg-green-100' : 'bg-red-100'} rounded`}>
          <p>{response.success ? 'Mensaje enviado con éxito.' : response.message}</p>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
