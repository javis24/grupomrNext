import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import jwt from 'jsonwebtoken';
import jsPDF from 'jspdf'; // Importamos jsPDF
import 'jspdf-autotable'; // Para la tabla

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
  const [filterField, setFilterField] = useState('address'); // Campo de filtro seleccionado
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [newClient, setNewClient] = useState({
    fullName: '',
    companyName: '',
    businessTurn: '',
    address: '',
    contactName: '',
    contactPhone: '',
    email: '',
    position: '',
  });

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

  const openModal = (client = null) => {
    setSelectedClient(client);
    if (client) {
      setNewClient(client); // Si está editando, precargar los datos
    } else {
      setNewClient({
        fullName: '',
        companyName: '',
        businessTurn: '',
        address: '',
        contactName: '',
        contactPhone: '',
        email: '',
        position: '',
      });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedClient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const decoded = jwt.decode(token);
    const userId = decoded.id; // Obtén el userId del token decodificado

    try {
      const clientData = { ...newClient, userId }; // Agregar el userId al objeto del cliente

      if (selectedClient) {
        // Editar cliente existente
        await axios.put(`/api/clients/${selectedClient.id}`, clientData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } else {
        // Crear nuevo cliente
        await axios.post('/api/clients', clientData, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }

      fetchClients();
      closeModal();
    } catch (error) {
      console.error('Error saving client:', error);
      setError('Failed to save client. Please try again.');
    }
  };

  // Filtro dinámico basado en el campo seleccionado
  const filteredClients = clients.filter((client) =>
    client[filterField]?.toLowerCase().includes(search.toLowerCase())
  );

  // Función para exportar un solo cliente a PDF
  const exportClientToPDF = (client) => {
    const doc = new jsPDF();
    doc.text('Client Details', 10, 10);
    doc.text(`Name: ${client.fullName}`, 10, 20);
    doc.text(`Company: ${client.companyName}`, 10, 30);
    doc.text(`Business Turn: ${client.businessTurn}`, 10, 40);
    doc.text(`Address: ${client.address}`, 10, 50);
    doc.text(`Contact: ${client.contactName}`, 10, 60);
    doc.text(`Phone: ${client.contactPhone}`, 10, 70);
    doc.text(`Email: ${client.email}`, 10, 80);
    doc.save(`${client.fullName}_details.pdf`);
  };

  // Función para exportar todos los clientes a PDF
  const exportAllClientsToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['Nombre', 'Compañía', 'Giro Comercial'];
    const tableRows = [];

    clients.forEach(client => {
      const clientData = [
        client.fullName,
        client.companyName,
        client.businessTurn,
      ];
      tableRows.push(clientData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });

    doc.save('all_clients.pdf');
  };

  return (
    <div className="p-8 bg-[#0e1624] text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Clients</h1>
        <div className="flex">
          <button onClick={() => openModal()} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2">
            Add New
          </button>
          <button onClick={exportAllClientsToPDF} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
            Export All to PDF
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="p-2 rounded bg-[#1f2937] text-white mr-4"
        >
          <option value="address">Address</option>
          <option value="contactName">Contact Name</option>
          <option value="contactPhone">Contact Phone</option>
          <option value="email">Email</option>
        </select>

        <input
          type="text"
          placeholder={`Search by ${filterField}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded bg-[#1f2937] text-white"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Mostrar mensaje si no hay clientes */}
      {clients.length === 0 ? (
        <p className="text-center">No clients found. Please add new clients.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto bg-[#1f2937] text-left rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Compañía</th>
                <th className="px-4 py-2">Giro Comercial</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#374151]">
                  <td className="px-4 py-2">{client.fullName}</td>
                  <td className="px-4 py-2">{client.companyName}</td>
                  <td className="px-4 py-2">{client.businessTurn}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => openModal(client)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">View</button>
                    <button onClick={() => exportClientToPDF(client)} className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mr-2">Export to PDF</button>
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
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Add/Edit Client"
      >
        <h2 className="text-2xl font-bold mb-4">{selectedClient ? 'Edit Client' : 'Add New Client'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primera columna de inputs */}
            <div className="mb-4">
              <label className="block text-white mb-2">Full Name</label>
              <input
                type="text"
                value={newClient.fullName}
                onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-white mb-2">Company Name</label>
              <input
                type="text"
                value={newClient.companyName}
                onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-white mb-2">Business Turn</label>
              <input
                type="text"
                value={newClient.businessTurn}
                onChange={(e) => setNewClient({ ...newClient, businessTurn: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
                required
              />
            </div>

            {/* Segunda columna de inputs */}
            <div className="mb-4">
              <label className="block text-white mb-2">Address</label>
              <input
                type="text"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-white mb-2">Contact Name</label>
              <input
                type="text"
                value={newClient.contactName}
                onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-white mb-2">Contact Phone</label>
              <input
                type="text"
                value={newClient.contactPhone}
                onChange={(e) => setNewClient({ ...newClient, contactPhone: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
              />
            </div>

            {/* Tercera columna de inputs */}
            <div className="mb-4">
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-white mb-2">Position</label>
              <input
                type="text"
                value={newClient.position}
                onChange={(e) => setNewClient({ ...newClient, position: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
              />
            </div>
          </div>

          <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
            {selectedClient ? 'Save Changes' : 'Add Client'}
          </button>
        </form>
      </Modal>

    </div>
  );
}
