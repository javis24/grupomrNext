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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
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

  const openModal = (client = null) => {
    setSelectedClient(client);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedClient(null);
  };

  // Filtro para buscar por dirección, contacto, teléfono y correo electrónico
  const filteredClients = clients.filter((client) =>
    client.address?.toLowerCase().includes(search.toLowerCase()) ||
    client.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    client.contactPhone?.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
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
        <input
          type="text"
          placeholder="Search by address, contact, phone or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded bg-[#1f2937] text-white"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Tabla simplificada */}
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

      {/* Modal para crear/editar clientes */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Edit Client"
      >
        {/* Contenido del modal aquí */}
      </Modal>
    </div>
  );
}
