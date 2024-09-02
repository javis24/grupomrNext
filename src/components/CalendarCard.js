import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useEffect } from 'react';

export default function CalendarCard() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientStatus, setClientStatus] = useState('');
  
  useEffect(() => {
    // Detectar el idioma del navegador y ajustar el locale
    const userLocale = navigator.language || 'es-ES';
    setLocale(userLocale);
  }, []);
  
  const [locale, setLocale] = useState('es-ES');

  const onDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleAddAppointment = () => {
    if (clientName && clientStatus) {
      const newAppointment = {
        date: date.toLocaleDateString(),
        name: clientName,
        status: clientStatus,
      };
      setAppointments([...appointments, newAppointment]);
      setClientName('');
      setClientStatus('');
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-6 bg-[#1f2937] text-white rounded-lg shadow-lg">
      <div className="flex flex-col w-full md:w-2/3">
        <h2 className="text-2xl font-bold mb-4">Calendar</h2>
        <Calendar
          onChange={onDateChange}
          value={date}
          locale={locale} // Aquí pasamos el locale detectado
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
          <button
            onClick={handleAddAppointment}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Add Appointment
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full md:w-1/3 mt-6 md:mt-0 md:ml-6">
        <h2 className="text-2xl font-bold mb-4">Appointments</h2>
        <div className="bg-[#374151] p-4 rounded-lg shadow-lg overflow-y-auto max-h-[300px]">
          {appointments.length === 0 ? (
            <p>No appointments scheduled</p>
          ) : (
            appointments.map((appointment, index) => (
              <div key={index} className="mb-4 p-2 bg-[#1f2937] rounded-lg">
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Client Name:</strong> {appointment.name}</p>
                <p><strong>Status:</strong> {appointment.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
