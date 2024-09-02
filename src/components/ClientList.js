// src/components/ClientList.js
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

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="p-8 bg-[#0e1624] text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Clients</h1>
        <button onClick={openModal} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
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
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Created at</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map((client) => (
            <tr key={client.id} className="hover:bg-[#374151]">
              <td className="px-4 py-2 flex items-center">
                <img
                  src={client.avatar || '/default-avatar.png'}
                  alt={client.name}
                  className="h-10 w-10 rounded-full mr-2"
                />
                {client.name}
              </td>
              <td className="px-4 py-2">{client.email}</td>
              <td className="px-4 py-2">{new Date(client.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-2">{client.status}</td>
              <td className="px-4 py-2">
                <button className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">View</button>
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

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Add New Client"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Add New Client</h2>
        <CreateClient />
        <button onClick={closeModal} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Close
        </button>
      </Modal>
    </div>
  );
}
