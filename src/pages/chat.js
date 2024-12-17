import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Chat() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Obtener la lista de clientes al cargar el componente
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get('/api/clients');
        setClients(res.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      alert('Por favor selecciona un cliente.');
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
      setResponse({ success: false, message: 'Error enviando mensaje.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Enviar Mensaje por WhatsApp</h1>

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar cliente por nombre"
            className="w-full p-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="mt-2 max-h-40 overflow-y-auto bg-gray-700 p-2 rounded-md">
            {clients
              .filter((client) =>
                client.fullName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((client) => (
                <div
                  key={client.id}
                  className={`p-2 cursor-pointer ${
                    selectedClient?.id === client.id ? 'bg-indigo-500' : ''
                  } hover:bg-indigo-400`}
                  onClick={() => handleClientSelect(client)}
                >
                  {client.fullName}
                </div>
              ))}
          </div>
        </div>

        {/* Detalles del cliente seleccionado */}
        {selectedClient && (
          <div className="mb-4">
            <p>
              <strong>Cliente seleccionado:</strong> {selectedClient.fullName}
            </p>
            <p>
              <strong>Teléfono:</strong> {selectedClient.contactPhone}
            </p>
          </div>
        )}

        {/* Formulario de mensaje */}
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
              className="w-full p-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
              required
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>

        {/* Feedback */}
        {response && (
          <div className="mt-4">
            {response.success ? (
              <p className="text-green-500">Mensaje enviado con éxito.</p>
            ) : (
              <p className="text-red-500">Error: {response.message}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
