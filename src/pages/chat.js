import Sidebar from '@/components/Sidebar';
import '../app/globals.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Chat() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/clients/namesPhones', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClients(res.data);
      } catch (error) {
        console.error('Error al obtener nombres y teléfonos de clientes:', error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(
        (client) =>
          client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactPhone.includes(searchTerm)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]); // No mostrar clientes si no hay búsqueda
    }
  }, [searchTerm, clients]);

  const handleClientSelect = (e) => {
    const selectedId = e.target.value;
    const client = clients.find((client) => client.id.toString() === selectedId);
    setSelectedClient(client);
    setResponse(null);
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

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-700 bg-[#1c2534] text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tabla de Clientes */}
        <div className="mb-4 overflow-x-auto">
          <table className="min-w-full bg-[#1c2534] rounded-md">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td className="py-2 px-4 border-b">{client.fullName}</td>
                  <td className="py-2 px-4 border-b">
                    {client.contactPhone ? (
                      <a
                        href={`https://wa.me/${client.contactPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {client.contactPhone}
                      </a>
                    ) : (
                      'Sin número'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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