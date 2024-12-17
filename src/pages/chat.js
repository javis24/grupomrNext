import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Chat() {
  const [clients, setClients] = useState([]); // Lista de clientes
  const [selectedClient, setSelectedClient] = useState(null); // Cliente seleccionado
  const [message, setMessage] = useState(''); // Mensaje a enviar
  const [loading, setLoading] = useState(false); // Estado de carga
  const [response, setResponse] = useState(null); // Respuesta de la API

  // Obtener la lista de clientes desde la API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local
        const res = await axios.get('/api/clients/namesPhones', {
          headers: {
            Authorization: `Bearer ${token}`, // Agregar el token en el encabezado
          },
        });
        setClients(res.data);
      } catch (error) {
        console.error('Error al obtener nombres y teléfonos de clientes:', error);
      }
    };
    fetchClients();
  }, []);
  
  

  const handleClientSelect = (e) => {
    const selectedId = e.target.value; // Obtener el ID del cliente seleccionado
    const client = clients.find((client) => client.id.toString() === selectedId);
    setSelectedClient(client);
    setResponse(null); // Limpiar cualquier respuesta previa
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      alert('Por favor selecciona un cliente antes de enviar un mensaje.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/whatsapp/sendMessage', {
        to: selectedClient.contactPhone,
        message,
      });
      setResponse(res.data);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setResponse({ success: false, message: 'Error al enviar el mensaje.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Enviar Mensaje por WhatsApp</h1>

        {/* Select para Todos los Clientes */}
        <div className="mb-4">
          <label htmlFor="clients" className="block text-sm font-medium mb-2">
            Seleccionar Cliente:
          </label>
          <select
            id="clients"
            onChange={handleClientSelect}
            className="w-full p-2 rounded-md border border-gray-700 bg-[#1c2534] text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Selecciona un Cliente --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Detalles del Cliente Seleccionado */}
        {selectedClient && (
          <div className="mb-4 p-4 bg-[#1c2534] rounded-md">
            <p>
              <strong>Cliente:</strong> {selectedClient.fullName}
            </p>
            <p>
              <strong>Teléfono:</strong> {selectedClient.contactPhone || 'Sin número'}
            </p>
          </div>
        )}

        {/* Formulario para Enviar Mensaje */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Mensaje:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí"
              className="w-full p-2 rounded-md border border-gray-700 bg-[#1c2534] text-white focus:ring-2 focus:ring-indigo-500"
              rows="4"
              required
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              className={`py-2 px-4 rounded-md text-white ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </div>
        </form>

        {/* Respuesta de la API */}
        {response && (
          <div
            className={`mt-4 p-3 rounded-md ${
              response.success ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {response.success ? (
              <p>✅ Mensaje enviado con éxito.</p>
            ) : (
              <p>❌ Error: {response.message}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
