import React, { useState, useEffect } from 'react'; 
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CalendarCard = () => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientStatus, setClientStatus] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('/api/appointments', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Error fetching appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleAddAppointment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    const decoded = jwt.decode(token);
    const userId = decoded.id;

    if (clientName && clientStatus) {
      try {
        const response = await axios.post(
          '/api/appointments',
          {
            date: date.toISOString(),
            clientName,
            clientStatus,
            userId,
          },
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );

        if (response.status === 201) {
          console.log('Cita creada con éxito');
          setAppointments([...appointments, response.data.appointment]);
          setClientName('');
          setClientStatus('');
        }
      } catch (error) {
        console.error('Error creando la cita:', error);
      }
    } else {
      alert('Por favor, rellena todos los campos');
    }
  };

  const handleEditAppointment = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.put(
        `/api/appointments/${id}`,
        {
          date,
          clientName,
          clientStatus,
        },
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      setAppointments(
        appointments.map((appointment) =>
          appointment.id === id ? { ...appointment, date, clientName, clientStatus } : appointment
        )
      );
      setEditingAppointment(null);
      setClientName('');
      setClientStatus('');
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleDeleteAppointment = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.delete(`/api/appointments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setAppointments(appointments.filter((appointment) => appointment.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  // Función para exportar una cita a PDF con el mismo diseño de los anteriores
  const exportAppointmentToPDF = (appointment) => {
    const doc = new jsPDF();
    const imgUrl = '/logo_mr.png';  // Ruta de tu logo

    const image = new Image();
    image.src = imgUrl;

    image.onload = () => {
      // Agregar el logo
      doc.addImage(image, 'PNG', 20, 10, 40, 40); // Aumentar el tamaño del logo

      // Información de la empresa
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: 'center' });
      doc.text("MRE040121UBA", 105, 37, { align: 'center' });

      // Sección de título
      doc.setFillColor(255, 204, 0); // Color amarillo
      doc.rect(160, 20, 40, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("CITA", 180, 27, null, 'center');

      // Detalles de la cita
      const appointmentDetails = [
        ["Fecha:", new Date(appointment.date).toLocaleDateString()],
        ["Nombre del Cliente:", appointment.clientName],
        ["Status:", appointment.clientStatus],
      ];

      doc.autoTable({
        body: appointmentDetails,
        startY: 50,
        theme: 'plain',
        styles: {
          cellPadding: 2,
          fontSize: 10,
        },
        columnStyles: {
          0: { halign: 'left', textColor: [0, 0, 0] },
          1: { halign: 'left', textColor: [0, 0, 0] },
        }
      });
      const observations = [
        "Precios más IVA",
        "Condiciones de pago: Negociable",
        "Nuestro personal cuenta con seguridad social, EPP y capacitación.",
        "Autorización Ambiental vigente.",
        "Teléfono de atención: 871-342 81 05"
      ];

      observations.forEach((obs, index) => {
        const obsTextWidth = doc.getTextWidth(obs);
        doc.text(105 - (obsTextWidth / 2), doc.lastAutoTable.finalY + 25 + (index * 6), obs);
      });

      // Pie de página
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      const footer1 = "Comercialización Grupo MR";
      const footer2 = "Visita nuestra página y conoce más sobre nosotros";
      const footer3 = "www.materialesreutilizables.com";

      doc.text(105, 250, footer1, null, 'center');
      doc.text(105, 253, footer2, null, 'center');
      doc.setTextColor(0, 0, 255);  // Color azul para el enlace
      doc.textWithLink(footer3, 86, 256, { url: "http://www.materialesreutilizables.com" });

      // Guardar el PDF
      doc.save(`Cita_${appointment.clientName}.pdf`);
    };
  };

  return (
    <div className="flex flex-col p-4 bg-[#1f2937] text-white rounded-lg shadow-lg md:flex-row md:p-6">
      <div className="flex flex-col w-full md:w-2/3">
        <h2 className="text-2xl font-bold mb-4">Calendario</h2>
        <div className="w-full mb-4">
          <Calendar
            onChange={setDate}
            value={date}
            locale="es-ES"
            className="bg-white rounded-md shadow-md w-full"
          />
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full p-3 mb-2 rounded bg-[#374151] text-white"
          />
          <input
            type="text"
            placeholder="Status"
            value={clientStatus}
            onChange={(e) => setClientStatus(e.target.value)}
            className="w-full p-3 mb-2 rounded bg-[#374151] text-white"
          />
          {editingAppointment ? (
            <button
              onClick={() => handleEditAppointment(editingAppointment.id)}
              className="w-full bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600"
            >
              Update Appointment
            </button>
          ) : (
            <button
              onClick={handleAddAppointment}
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
            >
              Crear Cita
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col w-full md:w-1/3 mt-6 md:mt-0 md:ml-6">
        <h2 className="text-2xl font-bold mb-4">Citas Creadas</h2>
        <div className="bg-[#374151] p-4 rounded-lg shadow-lg overflow-y-auto max-h-[300px]">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : appointments.length === 0 ? (
            <p>No hay citas agendadas</p>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="mb-4 p-3 bg-[#1f2937] rounded-lg">
                <p>
                  <strong>Fecha:</strong> {new Date(appointment.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Nombre del cliente:</strong> {appointment.clientName}
                </p>
                <p>
                  <strong>Status:</strong> {appointment.clientStatus}
                </p>
                <button
                  onClick={() => setEditingAppointment(appointment)}
                  className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteAppointment(appointment.id)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mr-2"
                >
                  Eliminar Cita
                </button>
                <button
                  onClick={() => exportAppointmentToPDF(appointment)}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Exportar a PDF
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

CalendarCard.displayName = "CalendarCard";

export default CalendarCard;
