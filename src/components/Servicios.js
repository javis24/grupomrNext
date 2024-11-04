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
  const [detalles, setDetalles] = useState('');
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
        detalles,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedServices = services.map(service => 
        service.id === selectedService.id 
          ? { ...service, contactName, programacion, equipo, numeroEconomico, contenido, manifiesto, renta2024, recoleccion, disposicion, contacto, telefono, email, ubicacion, rfc, detalles } 
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
        detalles,
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
      setDetalles(service.detalles)
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
      setDetalles('');
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
  
    // Obtener la fecha actual
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  
    // Logo del encabezado
    const imgUrl = '/logo_mr.png'; // Ruta de tu logo
    const image = new Image();
    image.src = imgUrl;
  
    image.onload = () => {
      doc.addImage(image, 'PNG', 10, 5, 50, 50);
  
      // Información de la empresa y cotización en el encabezado
      doc.setFontSize(10);
      doc.text("Materiales Reutilizables S.A. de C.V.", 100, 20, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 100, 27, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 100, 34, { align: 'center' });
  
      // Título de Cotización y Fecha
      doc.setFillColor(255, 178, 107); // Color naranja
      doc.rect(150, 20, 50, 15, 'F'); // Caja para "Cotización"
      doc.rect(150, 40, 50, 15, 'F'); // Caja para "Fecha"
  
      doc.setFontSize(12);
      doc.text("PRECIO SERVICIOS", 175, 28, { align: 'center' });
      doc.text(`Fecha: ${formattedDate}`, 175, 45, { align: 'center' });
  
      // Detalles del servicio
      const serviceDetails = [
        ["CLIENTE", service.contactName],
        ["PROGRAMACIÓN", service.programacion],
        ["EQUIPO", service.equipo],
        ["NÚMERO DE EQUIPO", service.numeroEconomico],
        ["CONTENIDO", service.contenido],
        ["MANIFIESTO", service.manifiesto],
        ["RENTA 2024", `$ ${service.renta2024}`],
        ["RECOLECCIÓN", `$ ${service.recoleccion}`],
        ["DISPOSICIÓN", `$ ${service.disposicion}`],
        ["CONTACTO", service.contacto],
        ["TELÉFONO", service.telefono],
        ["EMAIL", service.email],
        ["UBICACIÓN", service.ubicacion],
        ["RFC", service.rfc],
  
      ];
  
      // Tabla con detalles del servicio
      doc.autoTable({
        head: [["DESCRIPCIÓN", "VALOR"]],
        body: serviceDetails,
        startY: 60,  // Ajuste para empezar después del encabezado
        theme: 'grid',
        headStyles: { fillColor: [255, 178, 107] },
        styles: { fontSize: 8, halign: 'left' },
        margin: { left: 11 },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 120 } }
      });
  
      // Usamos doc.lastAutoTable.finalY después de que autoTable se ha generado
      const finalY = doc.lastAutoTable.finalY; // Guardar el valor de Y final después de la tabla
  
      // Sección de Observaciones
      doc.setFontSize(12);
      doc.setFillColor(255, 178, 107); 
      doc.rect(10, finalY + 20, 190, 10, 'F');
      doc.text("DETALLES ADICIONALES", 105, finalY + 27, null, 'center');
  
      // Insertar los detalles que el usuario ingresó en el campo de detalles
      const detalles = service.detalles || "No hay detalles adicionales.";
      doc.text(detalles, 105, finalY + 35, { align: 'center' });
  
     
  
      // Guardar el archivo PDF
      doc.save(`${service.programacion}_cotizacion.pdf`);
    };
  };
  
  


  const filteredServices = services.filter((service) =>
    service.programacion?.toLowerCase().includes(search.toLowerCase())
  );

  const exportAllServicesToPDF = () => {
    const doc = new jsPDF();
  
    // Obtener la fecha actual
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  
    // Logo del encabezado
    const imgUrl = '/logo_mr.png'; // Ruta de tu logo
    const image = new Image();
    image.src = imgUrl;
  
    image.onload = () => {
      doc.addImage(image, 'PNG', 10, 5, 50, 50);
  
      // Información de la empresa en el encabezado
      doc.setFontSize(10);
      doc.text("Materiales Reutilizables S.A. de C.V.", 100, 20, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 100, 27, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 100, 34, { align: 'center' });
  
      // Título de Cotización y Fecha
      doc.setFillColor(255, 178, 107); // Color naranja
      doc.rect(150, 20, 50, 15, 'F'); // Caja para "Cotización"
      doc.rect(150, 40, 50, 15, 'F'); // Caja para "Fecha"
  
      doc.setFontSize(12);
      doc.text("PRECIO SERVICIOS", 175, 28, { align: 'center' });
      doc.text(`Fecha: ${formattedDate}`, 175, 45, { align: 'center' });
  
      let currentY = 60; // Empezamos después del encabezado
  
      services.forEach((service, index) => {
        // Añadir encabezado para cada servicio
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Servicio ${index + 1}`, 20, currentY);
  
        // Detalles del servicio
        const serviceDetails = [
          ["CLIENTE", service.contactName],
          ["PROGRAMACIÓN", service.programacion],
          ["EQUIPO", service.equipo],
          ["NÚMERO DE EQUIPO", service.numeroEconomico],
          ["CONTENIDO", service.contenido],
          ["MANIFIESTO", service.manifiesto],
          ["RENTA 2024", `$ ${service.renta2024}`],
          ["RECOLECCIÓN", `$ ${service.recoleccion}`],
          ["DISPOSICIÓN", `$ ${service.disposicion}`],
          ["CONTACTO", service.contacto],
          ["TELÉFONO", service.telefono],
          ["EMAIL", service.email],
          ["UBICACIÓN", service.ubicacion],
          ["RFC", service.rfc],
        ];
  
        // Generar tabla con los detalles del servicio
        doc.autoTable({
          head: [["DESCRIPCIÓN", "VALOR"]],
          body: serviceDetails,
          startY: currentY + 10,
          theme: 'grid',
          headStyles: { fillColor: [255, 178, 107] },
          styles: { fontSize: 8, halign: 'left' },
          margin: { left: 11 },
          columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 120 } }
        });
  
        // Actualizar currentY para que la siguiente tabla no se sobreponga
        currentY = doc.lastAutoTable.finalY + 20;
      });
  
      // Sección de Observaciones para todos los servicios
      doc.setFontSize(12);
      doc.setFillColor(255, 178, 107); 
      doc.rect(10, currentY, 190, 10, 'F');
      doc.text("DETALLES ADICIONALES", 105, currentY + 7, null, 'center');
  
      const detalles = services.detalles || "No hay detalles adicionales.";
      doc.setFontSize(10);
      doc.text(detalles, 105, currentY + 15, { align: 'center' });
  
     
  
      // Guardar el archivo PDF
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
                <th className="px-2 py-2">Cliente</th>
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
                  <td className="px-4 py-2">$ {!isNaN(Number(service.renta2024)) ? Number(service.renta2024).toFixed(2) : '-'}</td>
                  <td className="px-4 py-2">$ {!isNaN(Number(service.recoleccion)) ? Number(service.recoleccion).toFixed(2) : '-'}</td>
                  <td className="px-4 py-2">$ {!isNaN(Number(service.disposicion)) ? Number(service.disposicion).toFixed(2) : '-'}</td>
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
                <label className="block text-white">Cliente</label>
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
              <div>
                <label className="block text-white">Detalless</label>
                <textarea
                name="detalles"
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
                className="w-full p-2 border rounded bg-[#374151] text-white"
                placeholder="Agregar detalles adicionales"
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
