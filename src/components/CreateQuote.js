import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CreateQuote = () => {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // Obtener clientes
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    // Obtener servicios
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/services', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchClients();
    fetchServices();
  }, []);

  const handleClientChange = (event) => {
    const clientId = event.target.value;
    const client = clients.find((c) => c.id === parseInt(clientId));
    setSelectedClient(client);
  };

  const handleServiceChange = (event) => {
    const serviceId = event.target.value;
    const service = services.find((s) => s.id === parseInt(serviceId));
    setSelectedService(service);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Cotización", 14, 10);

    const clientData = [
      ["Nombre del cliente", selectedClient?.fullName || ""],
      ["Compañía", selectedClient?.companyName || ""],
      ["Teléfono", selectedClient?.contactPhone || ""],
      ["Email", selectedClient?.email || ""]
    ];

    const serviceData = [
      ["Servicio", selectedService?.programacion || ""],
      ["Equipo", selectedService?.equipo || ""],
      ["Costo de recolección", selectedService?.recoleccion || ""],
      ["Disposición", selectedService?.disposicion || ""]
    ];

    doc.autoTable({
      head: [["Información del Cliente", ""]],
      body: clientData,
    });

    doc.autoTable({
      head: [["Información del Servicio", ""]],
      body: serviceData,
    });

    doc.save('cotizacion.pdf');
  };

  return (
    <div className="p-8 bg-[#0e1624] text-white">
      <h2 className="text-2xl font-bold mb-4">Crear Cotización</h2>

      {/* Select de Clientes */}
      <div className="mb-4">
        <label className="block mb-2">Seleccionar Cliente</label>
        <select
          onChange={handleClientChange}
          className="p-2 rounded bg-[#374151] text-white w-full"
        >
          <option value="">Seleccione un cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Select de Servicios */}
      <div className="mb-4">
        <label className="block mb-2">Seleccionar Servicio</label>
        <select
          onChange={handleServiceChange}
          className="p-2 rounded bg-[#374151] text-white w-full"
        >
          <option value="">Seleccione un servicio</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.programacion} - {service.equipo}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de detalles seleccionados */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Detalles de Cotización</h3>
        <table className="table-auto w-full text-left bg-[#1f2937] p-4 rounded-lg shadow-lg">
          <thead>
            <tr>
              <th className="pb-2">Detalle</th>
              <th className="pb-2">Información</th>
            </tr>
          </thead>
          <tbody>
            {/* Detalles del Cliente */}
            <tr>
              <td className="py-2">Cliente</td>
              <td className="py-2">{selectedClient?.fullName || "-"}</td>
            </tr>
            <tr>
              <td className="py-2">Compañía</td>
              <td className="py-2">{selectedClient?.companyName || "-"}</td>
            </tr>
            <tr>
              <td className="py-2">Teléfono</td>
              <td className="py-2">{selectedClient?.contactPhone || "-"}</td>
            </tr>

            {/* Detalles del Servicio */}
            <tr>
              <td className="py-2">Servicio</td>
              <td className="py-2">{selectedService?.programacion || "-"}</td>
            </tr>
            <tr>
              <td className="py-2">Equipo</td>
              <td className="py-2">{selectedService?.equipo || "-"}</td>
            </tr>
            <tr>
              <td className="py-2">Costo Recolección</td>
              <td className="py-2">{selectedService?.recoleccion || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Botón para generar PDF */}
      <button
        onClick={generatePDF}
        className="p-2 bg-blue-500 rounded text-white hover:bg-blue-600"
      >
        Generar PDF
      </button>
    </div>
  );
};

export default CreateQuote;
