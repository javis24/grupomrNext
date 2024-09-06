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

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [programacion, setProgramacion] = useState('');
  const [equipo, setEquipo] = useState('');
  const [numeroEconomico, setNumeroEconomico] = useState('');
  const [contenido, setContenido] = useState('');
  const [manifiesto, setManifiesto] = useState('');
  const [generado, setGenerado] = useState('');
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
    }
    fetchServices(); // Carga inicial de servicios
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/servicios/servicios', {
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
      fetchServices(); // Revalidar la lista de servicios después de eliminar
    } catch (error) {
      console.error('Error deleting service:', error);
      setError('Failed to delete service. Please try again.');
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/servicios/${selectedService.id}`, {
        programacion,
        equipo,
        numeroEconomico,
        contenido,
        manifiesto,
        generado,
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

      fetchServices(); // Revalidar la lista de servicios después de actualizar
      closeModal();
    } catch (error) {
      console.error('Error updating service:', error);
      setError('Failed to update service. Please try again.');
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/servicios/servicios', {
        programacion,
        equipo,
        numeroEconomico,
        contenido,
        manifiesto,
        generado,
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

      fetchServices(); // Revalidar la lista de servicios después de crear
      closeModal();
    } catch (error) {
      console.error('Error creating service:', error);
      setError('Failed to create service. Please try again.');
    }
  };

  const openModal = (service = null) => {
    setSelectedService(service);
    if (service) {
      setProgramacion(service.programacion);
      setEquipo(service.equipo);
      setNumeroEconomico(service.numeroEconomico);
      setContenido(service.contenido);
      setManifiesto(service.manifiesto);
      setGenerado(service.generado);
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
      setProgramacion('');
      setEquipo('');
      setNumeroEconomico('');
      setContenido('');
      setManifiesto('');
      setGenerado('');
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

  const filteredServices = services.filter((service) =>
    service.programacion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#0e1624] text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Servicios</h1>
        <button onClick={() => openModal()} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add New
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search for a service"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded bg-[#1f2937] text-white"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full table-auto bg-[#1f2937] text-left rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2">Programación</th>
            <th className="px-4 py-2">Equipo</th>
            <th className="px-4 py-2">Número Económico</th>
            <th className="px-4 py-2">Contenido</th>
            <th className="px-4 py-2">Manifiesto</th>
            <th className="px-4 py-2">Generado</th>
            <th className="px-4 py-2">Renta 2024</th>
            <th className="px-4 py-2">Recolección</th>
            <th className="px-4 py-2">Disposición</th>
            <th className="px-4 py-2">Contacto</th>
            <th className="px-4 py-2">Teléfono</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.map((service) => (
            <tr key={service.id} className="hover:bg-[#374151]">
              <td className="px-4 py-2">{service.programacion}</td>
              <td className="px-4 py-2">{service.equipo}</td>
              <td className="px-4 py-2">{service.numeroEconomico}</td>
              <td className="px-4 py-2">{service.contenido}</td>
              <td className="px-4 py-2">{service.manifiesto}</td>
              <td className="px-4 py-2">{service.generado}</td>
              <td className="px-4 py-2">{typeof service.renta2024 === 'number' ? service.renta2024.toFixed(2) : '-'}</td>
              <td className="px-4 py-2">{typeof service.recoleccion === 'number' ? service.recoleccion.toFixed(2) : '-'}</td>
              <td className="px-4 py-2">{typeof service.disposicion === 'number' ? service.disposicion.toFixed(2) : '-'}</td>
              <td className="px-4 py-2">{service.contacto}</td>
              <td className="px-4 py-2">{service.telefono}</td>
              <td className="px-4 py-2">
                <button onClick={() => openModal(service)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">View</button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para actualizar o crear servicio */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Edit Service"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">{selectedService ? 'Edit Service' : 'Add New Service'}</h2>
        <form onSubmit={selectedService ? handleUpdate : handleCreate}>
          <div className="grid grid-cols-2 gap-4 mb-4">
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
              <label className="block text-white">Número Económico</label>
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
              <label className="block text-white">Generado</label>
              <input
                type="text"
                value={generado}
                onChange={(e) => setGenerado(e.target.value)}
                className="w-full p-2 border rounded bg-[#374151] text-white"
              />
            </div>
            <div>
              <label className="block text-white">Renta 2024</label>
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
            {selectedService ? 'Update Service' : 'Create Service'}
          </button>
        </form>
        <button onClick={closeModal} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Close
        </button>
      </Modal>
    </div>
  );
}
