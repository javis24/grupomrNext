import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import jwt from 'jsonwebtoken';

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
  const [selectedClient, setSelectedClient] = useState(null);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessTurn, setBusinessTurn] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt.decode(token);
      setUserRole(decoded.role);
    }
    fetchClients(); // Carga inicial de clientes
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setClients(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again later.');
    }
  };

  const handleDelete = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/clients/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchClients(); // Revalidar la lista de clientes después de eliminar
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('Failed to delete client. Please try again.');
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/clients/${selectedClient.id}`, {
        fullName,
        companyName,
        businessTurn,
        address,
        contactName,
        contactPhone,
        email,
        position,
        userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      fetchClients(); // Revalidar la lista de clientes después de actualizar
      closeModal();
    } catch (error) {
      console.error('Error updating client:', error);
      setError('Failed to update client. Please try again.');
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/clients', {
        fullName,
        companyName,
        businessTurn,
        address,
        contactName,
        contactPhone,
        email,
        position,
        userId
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      fetchClients(); // Revalidar la lista de clientes después de crear
      closeModal();
    } catch (error) {
      console.error('Error creating client:', error);
      setError('Failed to create client. Please try again.');
    }
  };

  const openModal = (client = null) => {
    setSelectedClient(client);
    if (client) {
      setFullName(client.fullName);
      setCompanyName(client.companyName || '');
      setBusinessTurn(client.businessTurn || '');
      setAddress(client.address || '');
      setContactName(client.contactName || '');
      setContactPhone(client.contactPhone || '');
      setEmail(client.email || '');
      setPosition(client.position || '');
      setUserId(client.userId);
    } else {
      // Limpiar campos si se crea un nuevo cliente
      setFullName('');
      setCompanyName('');
      setBusinessTurn('');
      setAddress('');
      setContactName('');
      setContactPhone('');
      setEmail('');
      setPosition('');
      setUserId('');
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedClient(null);
  };

const filteredClients = clients.filter((client) =>
  client.fullName?.toLowerCase().includes(search.toLowerCase())
);


  return (
    <div className="p-8 bg-[#0e1624] text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Clients</h1>
        <button onClick={() => openModal()} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
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

      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto max-h-96"> 
      <table className="w-full table-auto bg-[#1f2937] text-left rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Compañía</th>
            <th className="px-4 py-2">Giro Comercial</th>
            <th className="px-4 py-2">Dirección</th>
            <th className="px-4 py-2">Contacto</th>
            <th className="px-4 py-2">Teléfono</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map((client) => (
            <tr key={client.id} className="hover:bg-[#374151]">
              <td className="px-4 py-2">{client.fullName}</td>
              <td className="px-4 py-2">{client.companyName}</td>
              <td className="px-4 py-2">{client.businessTurn}</td>
              <td className="px-4 py-2">{client.address}</td>
              <td className="px-4 py-2">{client.contactName}</td>
              <td className="px-4 py-2">{client.contactPhone}</td>
              <td className="px-4 py-2">{client.email}</td>
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
      </div>
      <Modal
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  style={customStyles}
  contentLabel="Edit Client"
>
  <h2 className="text-2xl font-bold mb-4 text-white">{selectedClient ? 'Edit Client' : 'Add New Client'}</h2>
  <form onSubmit={selectedClient ? handleUpdate : handleCreate}>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-white">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded bg-[#374151] text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full p-2 border rounded bg-[#374151] text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">Business Turn</label>
        <input
          type="text"
          value={businessTurn}
          onChange={(e) => setBusinessTurn(e.target.value)}
          className="w-full p-2 border rounded bg-[#374151] text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 border rounded bg-[#374151] text-white"
          required
        />
      </div>
      <div>
        <label className="block text-white">Contact Name</label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="w-full p-2 border rounded bg-[#374151] text-white"
        />
      </div>
      <div>
        <label className="block text-white">Contact Phone</label>
        <input
          type="text"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="w-full p-2 border rounded bg-[#374151] text-white"
        />
      </div>
      <div>
        <label className="block text-white">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded bg-[#374151] text-white"
        />
      </div>
      <div>
        <label className="block text-white">Position</label>
        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full p-2 border rounded bg-[#374151] text-white"
        />
      </div>
    </div>
    <button
      type="submit"
      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
    >
      {selectedClient ? 'Update Client' : 'Create Client'}
    </button>
  </form>
  <button onClick={closeModal} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
    Close
  </button>
</Modal>
    </div>
  );
}
