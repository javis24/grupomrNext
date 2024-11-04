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
  const [userEmail, setUserEmail] = useState('');
  const [newClient, setNewClient] = useState({
    fullName: '',
    companyName: '',
    businessTurn: '',
    address: '',
    contactName: '',
    contactPhone: '',
    email: '',
    position: '',
    planta: '',
    producto: '',
  });

        useEffect(() => {
          const token = localStorage.getItem('token');
          if (token) {
            const decoded = jwt.decode(token);
            setUserEmail(decoded.email); // Guardamos el correo del usuario
          }
        }, []);

        useEffect(() => {
          if (userEmail) {
            fetchClients();
          }
        }, [userEmail]);

        const fetchClients = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/clients', {
              headers: { 'Authorization': `Bearer ${token}` },
            });
      
            let fetchedClients = response.data;
      
            // Filtrar los clientes si el usuario es "tarimas@grupomrlaguna.com"
            if (userEmail === 'tarimas@grupomrlaguna.com') {
              fetchedClients = fetchedClients.filter(
                (client) => client.planta && client.planta.toLowerCase() === 'tarimas'
              );
            }
      
            setClients(fetchedClients);
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
        planta: '',
        producto: '',
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

  const filteredClients = clients.filter((client) => {
    const fieldValue = client[filterField] ? client[filterField].toString().toLowerCase() : '';
    console.log(`Filtering by ${filterField}: checking "${fieldValue}" against "${search.toLowerCase()}"`);
    return fieldValue.includes(search.toLowerCase());
  });
  

  // Función para exportar un solo cliente a PDF con estilo
const exportClientToPDF = (client) => {
  const doc = new jsPDF();
  const imgUrl = '/logo_mr.png';  // Ruta de tu logo

  const image = new Image();
  image.src = imgUrl;

  image.onload = () => {
    doc.addImage(image, 'PNG', 20, 10, 20, 20);

    // Información de la empresa
    doc.setFontSize(12);
    doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
    doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: 'center' });
    doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: 'center' });
    doc.text("MRE040121UBA", 105, 37, { align: 'center' });

    // Sección de datos del cliente
    doc.setFillColor(255, 204, 0); // Color amarillo
    doc.rect(160, 20, 40, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("CLIENTE", 180, 27, null, 'center'); 

    // Información del cliente
    const clientDetails = [
      ["NOMBRE", client.fullName],
      ["EMPRESA", client.companyName],
      ["GIRO COMERCIAL", client.businessTurn],
      ["DIRECCIÓN", client.address],
      ["NOMBRE DE CONTACTO", client.contactName],
      ["TELÉFONO DE CONTACTO", client.contactPhone],
      ["CORREO ELECTRÓNICO", client.email],
      ["CARGO", client.position],
      ["PLANTA", client.planta],
      ["PRODUCTO", client.producto],
    ];

    // Ajustar la tabla para que sea más compacta
    doc.autoTable({
      body: clientDetails,
      startY: 50,
      theme: 'plain',
      styles: {
        cellPadding: 1,  // Reduce el padding para que el contenido esté más junto
        fontSize: 10,  // Tamaño de fuente más pequeño para que todo quepa bien
        lineWidth: 0.1, // Hace las líneas de la tabla más delgadas
      },
      columnStyles: {
        0: { halign: 'left', textColor: [0, 0, 0], cellWidth: 60 },  // Ajustar ancho de la primera columna
        1: { halign: 'left', textColor: [0, 0, 0], cellWidth: 100 },  // Ajustar ancho de la segunda columna
      }
    });
        doc.save(`${client.fullName}_details.pdf`);
      };
    };



// Función para exportar todos los clientes a PDF con estilo
const exportAllClientsToPDF = () => {
  const doc = new jsPDF();
  const imgUrl = '/logo_mr.png';  // Ruta de tu logo

  const image = new Image();
  image.src = imgUrl;

  image.onload = () => {
    doc.addImage(image, 'PNG', 20, 10, 40, 40);

    // Información de la empresa
    doc.setFontSize(12);
    doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
    doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: 'center' });
    doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: 'center' });
    doc.text("MRE040121UBA", 105, 37, { align: 'center' });

    // Título del documento
    doc.setFontSize(14);
    doc.setFillColor(255, 204, 0); // Color amarillo
    doc.rect(14, 50, 182, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text("LISTA DE CLIENTES", 105, 57, null, 'center');

    // Preparar datos para la tabla
    const tableColumn = ['NOMBRE', 'COMPAÑÍA', 'GIRO COMERCIAL', 'DIRECCIÓN', 'CONTACTO', 'TELÉFONO'];
    const tableRows = [];

    clients.forEach(client => {
      const clientData = [
        client.fullName,
        client.companyName,
        client.businessTurn,
        client.address,
        client.contactName,
        client.contactPhone,
      ];
      tableRows.push(clientData);
    });

    // Generar la tabla con todos los clientes
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 204, 0],  // Color amarillo para la cabecera
        textColor: 0,
      },
      styles: {
        fontSize: 10,  // Tamaño de fuente más compacto para la tabla
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
      }
    });

    
    doc.save('clientes.pdf');
  };
};


  return (
    <div className="p-1 bg-[#0e1624] text-white min-h-screen">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <div className="flex">
          <button onClick={() => openModal()} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2">
            Añadir 
          </button>
          <button onClick={exportAllClientsToPDF} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
            Descargar todo a PDF
          </button>
        </div>
      </div>

      <div className="relative mb-4 ">
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="p-2 rounded bg-[#1f2937] text-white mr-4"
        >
          <option value="address">Dirección</option>
          <option value="contactName">Nombre del Cliente</option>
          <option value="contactPhone">Teléfono del Cliente</option>
          <option value="planta">Planta</option>
          <option value="email">Email</option>
        </select>

        <input
          type="text"
          placeholder={`Buscar por ${filterField}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded bg-[#1f2937] text-white"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Mostrar mensaje si no hay clientes */}
      {clients.length === 0 ? (
        <p className="text-center">No se encontraron clientes. Por favor, agregue nuevos clientes.</p>
      ) : (
        <div className="">
      <table className="min-w-full table-auto bg-[#1f2937] text-left rounded-lg">
        <thead>
          <tr className="bg-[#2d3748]">
            <th className="px-4 py-2 w-1/4">Nombre</th>
            <th className="px-4 py-2 w-1/4">Compañía</th>
            <th className="px-4 py-2 w-1/4">Acciones</th>
          </tr>
        </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#374151]">
                  <td className="px-4 py-2">{client.fullName}</td>
                  <td className="px-4 py-2">{client.companyName}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => openModal(client)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">Ver Cliente</button>
                    <button onClick={() => exportClientToPDF(client)} className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mr-2">Exportar a PDF</button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      Eliminar Cliente
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
          <h2 className="text-2xl font-bold mb-4 text-white">{selectedClient ? 'Editar Cliente' : 'Añadir Cliente'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {/* Primera columna de inputs */}
              <div className="mb-4">
                <label className="block text-white mb-2">Razon Social</label>
                <input
                  type="text"
                  value={newClient.fullName}
                  onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Nombre de Empresa</label>
                <input
                  type="text"
                  value={newClient.companyName}
                  onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Giro de Negocios</label>
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
                <label className="block text-white mb-2">Dirección</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Nombre de contacto</label>
                <input
                  type="text"
                  value={newClient.contactName}
                  onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Teléfono de contacto</label>
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
                <label className="block text-white mb-2">Departamento</label>
                <input
                  type="text"
                  value={newClient.position}
                  onChange={(e) => setNewClient({ ...newClient, position: e.target.value })}
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                />
              </div>
              <div className="mb-4">
              <label className="block text-white mb-2">Planta</label>
              <input
                type="text"
                value={newClient.planta}
                onChange={(e) => setNewClient({ ...newClient, planta: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2">Producto</label>
              <input
                type="text"
                value={newClient.producto}
                onChange={(e) => setNewClient({ ...newClient, producto: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
                required
              />
            </div>
          
            </div>

            <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
              {selectedClient ? 'Guardar Cliente' : 'Añadir Cliente'}
            </button>
          </form>
        </Modal>


      
    </div>
  );
}
