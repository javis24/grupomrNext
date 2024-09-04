import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import CreateClient from './CreateClient';

// Establecer los estilos del modal
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937',
    border: 'none',
    borderRadius: '8px',
    padding: '20px',
  },
};

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null); // Estado para el cliente seleccionado
  const [fullName, setFullName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [position, setPosition] = useState('');
  
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients'); // Ajusta la ruta según tu API
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const handleDelete = async (clientId) => {
    try {
      await axios.delete(`/api/clients/${clientId}`); // Ajusta la ruta según tu API
      setClients(clients.filter((client) => client.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/clients/${selectedClient.id}`, {
        fullName,
        contactName,
        contactPhone,
        position,
      });

      // Actualizar la lista de clientes
      setClients(clients.map((client) =>
        client.id === selectedClient.id ? { ...client, fullName, contactName, contactPhone, position } : client
      ));

      closeModal();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const openModal = (client) => {
    setSelectedClient(client);
    setFullName(client.fullName);
    setContactName(client.contactName || '');
    setContactPhone(client.contactPhone || '');
    setPosition(client.position || '');
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedClient(null);
  };

  const filteredClients = clients.filter((client) =>
    client.fullName.toLowerCase().includes(search.toLowerCase()) ||
    client.contactName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#0e1624] text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Clients</h1>
        <button onClick={() => openModal({})} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add New
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search for a client"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded bg-[#1f2937] text-white"
        />
      </div>

      <table className="w-full table-auto bg-[#1f2937] text-left rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2">Full Name</th>
            <th className="px-4 py-2">Contact Name</th>
            <th className="px-4 py-2">Contact Phone</th>
            <th className="px-4 py-2">Position</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map((client) => (
            <tr key={client.id} className="hover:bg-[#374151]">
              <td className="px-4 py-2">{client.fullName}</td>
              <td className="px-4 py-2">{client.contactName || 'N/A'}</td>
              <td className="px-4 py-2">{client.contactPhone || 'N/A'}</td>
              <td className="px-4 py-2">{client.position || 'N/A'}</td>
              <td className="px-4 py-2">
                <button onClick={() => openModal(client)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">View</button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para actualizar cliente */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Edit Client"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">{selectedClient && selectedClient.id ? 'Edit Client' : 'Add New Client'}</h2>
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-white">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border rounded bg-[#374151] text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white">Contact Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full p-2 border rounded bg-[#374151] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white">Contact Phone</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full p-2 border rounded bg-[#374151] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white">Position</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full p-2 border rounded bg-[#374151] text-white"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {selectedClient && selectedClient.id ? 'Update Client' : 'Create Client'}
          </button>
        </form>
        <button onClick={closeModal} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Close
        </button>
      </Modal>
    </div>
  );
}
