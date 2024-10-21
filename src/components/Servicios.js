import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import jwt from 'jsonwebtoken';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [contactName, setContactName] = useState('');
  const [programacion, setProgramacion] = useState('');
  const [equipo, setEquipo] = useState('');
  const [numeroEconomico, setNumeroEconomico] = useState('');
  const [contenido, setContenido] = useState('');
  const [manifiesto, setManifiesto] = useState('');
  const [renta2024, setRenta2024] = useState('');
  const [recoleccion, setRecoleccion] = useState('');
  const [disposicion, setDisposicion] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [rfc, setRfc] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      const decoded = jwt.decode(token);
      setUserRole(decoded.role);
      setUserId(decoded.id);
    }
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/servicios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again later.');
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/servicios/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(services.filter(service => service.id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      setError('Failed to delete service. Please try again.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!selectedService || !selectedService.id) {
        setError('No service selected for update');
        return;
      }
      
      await axios.put(`/api/servicios/${selectedService.id}`, {
        contactName,
        programacion,
        equipo,
        numeroEconomico,
        contenido,
        manifiesto,
        renta2024,
        recoleccion,
        disposicion,
        contacto,
        telefono,
        email,
        ubicacion,
        rfc,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedServices = services.map(service => 
        service.id === selectedService.id 
          ? { ...service, contactName, programacion, equipo, numeroEconomico, contenido, manifiesto, renta2024, recoleccion, disposicion, contacto, telefono, email, ubicacion, rfc } 
          : service
      );
      setServices(updatedServices);
      closeModal();
    } catch (error) {
      console.error('Error updating service:', error);
      setError('Failed to update service. Please try again.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/servicios/', {
        contactName,
        programacion,
        equipo,
        numeroEconomico,
        contenido,
        manifiesto,
        renta2024,
        recoleccion,
        disposicion,
        contacto,
        telefono,
        email,
        ubicacion,
        rfc,
        userId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setServices([...services, response.data.service]);
      closeModal();
    } catch (error) {
      console.error('Error creating service:', error);
      setError('Failed to create service. Please try again.');
    }
  };

  const openModal = (service = null) => {
    setSelectedService(service);
    if (service) {
      setContactName(service.contactName);
      setProgramacion(service.programacion);
      setEquipo(service.equipo);
      setNumeroEconomico(service.numeroEconomico);
      setContenido(service.contenido);
      setManifiesto(service.manifiesto);
      setRenta2024(service.renta2024);
      setRecoleccion(service.recoleccion);
      setDisposicion(service.disposicion);
      setContacto(service.contacto);
      setTelefono(service.telefono);
      setEmail(service.email);
      setUbicacion(service.ubicacion);
      setRfc(service.rfc);
      setUserId(service.userId);
    } else {
      // Limpiar campos si se crea un nuevo servicio
      setContactName('');
      setProgramacion('');
      setEquipo('');
      setNumeroEconomico('');
      setContenido('');
      setManifiesto('');
      setRenta2024('');
      setRecoleccion('');
      setDisposicion('');
      setContacto('');
      setTelefono('');
      setEmail('');
      setUbicacion('');
      setRfc('');
      setUserId('');
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedService(null);
  };

  const exportServiceToPDF = (service) => {
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

      // Sección de datos del servicio
      doc.setFillColor(255, 204, 0); // Color amarillo
      doc.rect(160, 20, 40, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("SERVICIO", 180, 27, null, 'center'); 

      // Información del servicio
      const serviceDetails = [
        ["NOMBRE Del CONTACTO", service.contactName],
        ["PROGRAMACIÓN", service.programacion],
        ["EQUIPO", service.equipo],
        ["NÚMERO ECONÓMICO", service.numeroEconomico],
        ["CONTENIDO", service.contenido],
        ["MANIFIESTO", service.manifiesto],
        ["RENTA 2024", `$ ${service.renta2024}`],
        ["RECOLECCIÓN", `$ ${service.recoleccion}`],
        ["DISPOSICIÓN", `$ ${service.disposicion}`],
        ["UBICACIÓN", service.ubicacion],
        ["CONTACTO", service.contacto],
        ["TELÉFONO", service.telefono],
      ];

      doc.autoTable({
        body: serviceDetails,
        startY: 50,
        theme: 'plain',
        styles: { cellPadding: 1, fontSize: 10, lineWidth: 0.1 },
        columnStyles: {
          0: { halign: 'left', textColor: [0, 0, 0], cellWidth: 60 },
          1: { halign: 'left', textColor: [0, 0, 0], cellWidth: 100 },
        }
      });

      doc.save(`${service.programacion}_details.pdf`);
    };
  };

  const filteredServices = services.filter((service) =>
    service.programacion?.toLowerCase().includes(search.toLowerCase())
  );

  const exportAllServicesToPDF = () => {
    const doc = new jsPDF();
    const imgUrl = '/logo_mr.png';  // Ruta de tu logo
  
    let currentY = 10;  // Empezamos desde la parte superior del PDF
  
    const image = new Image();
    image.src = imgUrl;
  
    image.onload = () => {
      doc.addImage(image, 'PNG', 20, 10, 20, 20);
      
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, currentY + 10, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, currentY + 17, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, currentY + 22, { align: 'center' });
      doc.text("MRE040121UBA", 105, currentY + 27, { align: 'center' });
  
      services.forEach((service, index) => {
        // Añadir encabezado para cada servicio
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Servicio ${index + 1}`, 20, currentY + 40);
  
        const serviceDetails = [
          ["NOMBRE Del CONTACTO", service.contactName],
          ["PROGRAMACIÓN", service.programacion],
          ["EQUIPO", service.equipo],
          ["NÚMERO ECONÓMICO", service.numeroEconomico],
          ["CONTENIDO", service.contenido],
          ["MANIFIESTO", service.manifiesto],
          ["RENTA 2024", `$ ${service.renta2024}`],
          ["RECOLECCIÓN", `$ ${service.recoleccion}`],
          ["DISPOSICIÓN", `$ ${service.disposicion}`],
          ["UBICACIÓN", service.ubicacion],
          ["CONTACTO", service.contacto],
          ["TELÉFONO", service.telefono],
        ];
  
        doc.autoTable({
          body: serviceDetails,
          startY: currentY + 45,  // Ajustar el inicio en Y para cada servicio
          theme: 'plain',
          styles: { cellPadding: 1, fontSize: 12, lineWidth: 0.1 },
          columnStyles: {
            0: { halign: 'left', textColor: [0, 0, 0], cellWidth: 60 },
            1: { halign: 'left', textColor: [0, 0, 0], cellWidth: 100 },
          },
        });
  
        currentY = doc.lastAutoTable.finalY + 15; // Añadir más espacio entre servicios
      });
  
      doc.save('todos_los_servicios.pdf');
    };
  };
  

  return (
    <div className="p-4 bg-[#0e1624] text-white min-h-screen flex justify-center">
      <div className="max-w-7xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Servicios</h1>
          <button onClick={() => openModal()} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Agregar nuevo servicio
          </button>
          <button onClick={exportAllServicesToPDF} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Exportar todos a PDF
            </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar un servicio"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full table-auto bg-[#1f2937] text-left rounded-lg">
            <thead>
              <tr>
                <th className="px-2 py-2">Nombre</th>
                <th className="px-2 py-2">Programación</th>
                <th className="px-2 py-2">Equipo</th>
                <th className="px-2 py-2">Número Equipo</th>
                <th className="px-2 py-2">Contenido</th>
                <th className="px-2 py-2">Manifiesto</th>
                <th className="px-2 py-2">Renta</th>
                <th className="px-2 py-2">Recolección</th>
                <th className="px-2 py-2">Disposición</th>
                <th className="px-2 py-2">Ubicación</th>
                <th className="px-2 py-2">Contacto</th>
                <th className="px-2 py-2">Teléfono</th>
                <th className="px-2 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-[#374151]">
                    <td className="px-4 py-2">{service.contactName}</td>
                  <td className="px-4 py-2">{service.programacion}</td>
                  <td className="px-4 py-2">{service.equipo}</td>
                  <td className="px-4 py-2">{service.numeroEconomico}</td>
                  <td className="px-4 py-2">{service.contenido}</td>
                  <td className="px-4 py-2">{service.manifiesto}</td>
                  <td className="px-4 py-2">$ {typeof service.renta2024 === 'number' ? service.renta2024.toFixed(2) : '-'}</td>
                  <td className="px-4 py-2">{typeof service.recoleccion === 'number' ? service.recoleccion.toFixed(2) : '-'}</td>
                  <td className="px-4 py-2">{typeof service.disposicion === 'number' ? service.disposicion.toFixed(2) : '-'}</td>
                  <td className="px-4 py-2">{service.ubicacion}</td>
                  <td className="px-4 py-2">{service.contacto}</td>
                  <td className="px-4 py-2">{service.telefono}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => openModal(service)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">Ver..</button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      Elim..
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para actualizar o crear servicio */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Edit Service"
        >
          <h2 className="text-2xl font-bold mb-4 text-white">{selectedService ? 'Edit Service' : 'Add New Service'}</h2>
          <form onSubmit={selectedService ? handleUpdate : handleCreate}>
            <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
                <label className="block text-white">Nombre de Contacto</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Programación</label>
                <input
                  type="text"
                  value={programacion}
                  onChange={(e) => setProgramacion(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Equipo</label>
                <input
                  type="text"
                  value={equipo}
                  onChange={(e) => setEquipo(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Número Equipo</label>
                <input
                  type="text"
                  value={numeroEconomico}
                  onChange={(e) => setNumeroEconomico(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Contenido</label>
                <input
                  type="text"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Manifiesto</label>
                <input
                  type="text"
                  value={manifiesto}
                  onChange={(e) => setManifiesto(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Renta</label>
                <input
                  type="number"
                  value={renta2024}
                  onChange={(e) => setRenta2024(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Recolección</label>
                <input
                  type="number"
                  value={recoleccion}
                  onChange={(e) => setRecoleccion(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Disposición</label>
                <input
                  type="number"
                  value={disposicion}
                  onChange={(e) => setDisposicion(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Contacto</label>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
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
                <label className="block text-white">Ubicación</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                />
              </div>
              <div>
                <label className="block text-white">RFC</label>
                <input
                  type="text"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value)}
                  className="w-full p-2 border rounded bg-[#374151] text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              {selectedService ? 'Actualizar Servicio' : 'Crear Servicio'}
            </button>
          </form>

          {/* Botón para exportar a PDF */}
          {selectedService && (
            <button
              onClick={() => exportServiceToPDF(selectedService)}
              className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Exportar al PDF
            </button>
          )}
          <button onClick={closeModal} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
            Cerrar
          </button>
        </Modal>
      </div>
    </div>
  );
}
