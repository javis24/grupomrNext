import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import jwt from 'jsonwebtoken';


export default function CalendarCard() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientStatus, setClientStatus] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/appointments', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  const handleAddAppointment = async () => {
    const token = localStorage.getItem('token');
    const decoded = jwt.decode(token);
    const userId = decoded.id;  // Obtenemos el ID del usuario autenticado
  
    if (clientName && clientStatus) {
      try {
        const response = await axios.post('/api/appointments', {
          date: date.toISOString(), // Enviar la fecha en formato ISO
          clientName,
          clientStatus,
          userId
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
  
        if (response.status === 201) {
          console.log('Cita creada con éxito');
          setAppointments([...appointments, response.data.appointment]); // Agregar la cita al estado
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
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/appointments/${id}`, {
        date,
        clientName,
        clientStatus,
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setAppointments(
        appointments.map((appointment) =>
          appointment.id === id ? { ...appointment, date, clientName, clientStatus } : appointment
        )
      );
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/appointments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setAppointments(appointments.filter((appointment) => appointment.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-6 bg-[#1f2937] text-white rounded-lg shadow-lg">
      <div className="flex flex-col w-full md:w-2/3">
        <h2 className="text-2xl font-bold mb-4">Calendar</h2>
        <Calendar
          onChange={setDate}
          value={date}
          locale="es-ES"
          className="bg-white rounded-md shadow-md"
        />
        <div className="mt-4">
          <input
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full p-2 mb-2 rounded bg-[#374151] text-white"
          />
          <input
            type="text"
            placeholder="Client Status"
            value={clientStatus}
            onChange={(e) => setClientStatus(e.target.value)}
            className="w-full p-2 mb-2 rounded bg-[#374151] text-white"
          />
          {editingAppointment ? (
            <button
              onClick={() => handleEditAppointment(editingAppointment.id)}
              className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
            >
              Update Appointment
            </button>
          ) : (
            <button
              onClick={handleAddAppointment}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Add Appointment
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col w-full md:w-1/3 mt-6 md:mt-0 md:ml-6">
        <h2 className="text-2xl font-bold mb-4">Appointments</h2>
        <div className="bg-[#374151] p-4 rounded-lg shadow-lg overflow-y-auto max-h-[300px]">
          {appointments.length === 0 ? (
            <p>No appointments scheduled</p>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="mb-4 p-2 bg-[#1f2937] rounded-lg">
                <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Client Name:</strong> {appointment.clientName}</p>
                <p><strong>Status:</strong> {appointment.clientStatus}</p>
                <button onClick={() => setEditingAppointment(appointment)} className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteAppointment(appointment.id)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
