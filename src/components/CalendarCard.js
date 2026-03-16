import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load para el calendario
const Calendar = lazy(() => import('react-calendar'));
import 'react-calendar/dist/Calendar.css';

const CalendarCard = () => {
  // --- ESTADOS ---
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientStatus, setClientStatus] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Estados para Autocompletado profesional
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- CARGA DE DATOS INICIAL ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [resUsers, resAppo] = await Promise.all([
        axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/appointments', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(resUsers.data);
      setAppointments(resAppo.data);
    } catch (err) {
      setError('Error al cargar la información');
      toast.error('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LÓGICA DE BÚSQUEDA DE CLIENTES (AUTOCOMPLETADO) ---
  useEffect(() => {
    const triggerSearch = async () => {
      if (clientName.length < 2) {
        setClientSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/clients/search?q=${clientName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientSuggestions(res.data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error al buscar sugerencias");
      }
    };

    const timeoutId = setTimeout(triggerSearch, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [clientName]);

  // --- HANDLERS ---
  const handleAddAppointment = async () => {
    if (!clientName || !clientStatus || !selectedUser) {
      return toast.warning('Completa todos los campos (Cliente, Status y Asesor)');
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/appointments', 
        { 
          date: date.toISOString(), 
          clientName, 
          clientStatus, 
          assignedTo: parseInt(selectedUser) 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(prev => [...prev, response.data]);
      resetForm();
      toast.success('Cita agendada correctamente');
    } catch (e) { toast.error('Error al guardar la cita'); }
  };

  const handleEditAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/appointments/${id}`, 
        { 
          date: date.toISOString(), 
          clientName, 
          clientStatus, 
          assignedTo: parseInt(selectedUser) 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData(); 
      resetForm();
      toast.success('Cita actualizada');
    } catch (e) { toast.error('Error al actualizar'); }
  };

  const handleDeleteAppointment = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta cita?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/appointments/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast.info('Cita eliminada');
    } catch (e) { toast.error('No se pudo eliminar'); }
  };

  const resetForm = () => {
    setClientName('');
    setClientStatus('');
    setSelectedUser('');
    setEditingAppointment(null);
  };

  const exportToPDF = (appointment) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Resumen de Cita - Materiales Reutilizables", 20, 20);
    doc.autoTable({
      startY: 30,
      head: [['Concepto', 'Detalle']],
      body: [
        ["Fecha", format(new Date(appointment.date), 'PPP', { locale: es })],
        ["Cliente", appointment.clientName],
        ["Asesor Asignado", appointment.assignedUser?.name || 'No asignado'],
        ["Status actual", appointment.clientStatus],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }
    });
    doc.save(`Cita_${appointment.clientName}.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row p-2 md:p-6 bg-[#0e1624] gap-6 min-h-screen text-white">
      <div className="w-full lg:w-7/12 space-y-6">
        <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📅 <span>Calendario de Actividades</span>
          </h2>
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-700 rounded-lg"></div>}>
            <Calendar 
              onChange={setDate} 
              value={date} 
              locale="es-ES" 
              className="w-full rounded-lg border-none text-black shadow-inner" 
            />
          </Suspense>
        </div>

        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-400">
            {editingAppointment ? '✏️ Modificar Cita' : '➕ Agendar Nueva Cita'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Input de Nombre con Lista de Sugerencias */}
            <div className="flex flex-col relative">
              <input 
                type="text" 
                placeholder="Nombre del cliente..." 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                onFocus={() => clientName.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              
              {showSuggestions && clientSuggestions.length > 0 && (
                <ul className="absolute z-50 w-full top-full mt-1 bg-[#1f2937] border border-gray-600 rounded-lg shadow-2xl max-h-56 overflow-y-auto">
                  {clientSuggestions.map((client) => (
                    <li 
                      key={client.id}
                      onClick={() => {
                        setClientName(client.fullName);
                        setClientPhone(client.contactPhone || '');
                        if(client.assignedUser) setSelectedUser(client.assignedUser);
                        setShowSuggestions(false);
                      }}
                      className="p-3 hover:bg-blue-600 cursor-pointer text-sm border-b border-gray-700 last:border-none transition-colors flex justify-between items-center"
                    >
                      <span>{client.fullName}</span>
                      <span className="text-[10px] text-gray-400">SELECCIONAR</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Asignar Asesor</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>

            <input 
              type="text" 
              placeholder="Status" 
              value={clientStatus} 
              onChange={(e) => setClientStatus(e.target.value)} 
              className="bg-[#374151] border border-gray-600 rounded-lg p-3 md:col-span-2 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="md:col-span-2 flex flex-col gap-2">
              <button 
                onClick={() => editingAppointment ? handleEditAppointment(editingAppointment.id) : handleAddAppointment()}
                className={`p-3 rounded-lg font-bold transition-all transform active:scale-95 shadow-md ${
                  editingAppointment ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {editingAppointment ? 'Guardar Cambios' : 'Confirmar Cita'}
              </button>
              {editingAppointment && (
                <button onClick={resetForm} className="text-gray-400 hover:text-white underline text-sm">
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-5/12">
        <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 h-full max-h-screen overflow-hidden flex flex-col shadow-2xl">
          <h2 className="text-xl font-bold mb-4">Próximas Citas</h2>
          <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-800 animate-pulse rounded-lg border border-gray-700"></div>)
            ) : appointments.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 italic">No hay citas en el historial.</p>
                </div>
            ) : [...appointments].reverse().map(appo => (
              <div key={appo.id} className="p-4 bg-[#2d3748] rounded-lg border-l-4 border-blue-500 group transition-all hover:bg-[#323d4e] shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-blue-400 font-mono font-semibold">
                        {format(new Date(appo.date), "eeee d 'de' MMMM", { locale: es })}
                    </p>
                    <h4 className="font-bold text-lg text-white mt-1">{appo.clientName}</h4>
                    <p className="text-xs text-gray-400">👤 {appo.assignedUser?.name || 'Sin asesor'}</p>
                  </div>
                  <span className="text-[9px] uppercase font-black bg-gray-900 px-2 py-1 rounded text-blue-300 border border-blue-500/30">
                    {appo.clientStatus}
                  </span>
                </div>
                
              <div className="flex gap-4 mt-4 pt-3 border-t border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={() => { 
                  setEditingAppointment(appo); 
                  setClientName(appo.clientName); 
                  setClientStatus(appo.clientStatus); 
                  setSelectedUser(appo.assignedTo || '');
                  setDate(new Date(appo.date));
                }} className="text-[11px] text-yellow-500 font-bold hover:text-yellow-400">EDITAR</button>
              
              <button onClick={() => handleDeleteAppointment(appo.id)} className="text-[11px] text-red-500 font-bold hover:text-red-400">ELIMINAR</button>
              
              <button onClick={() => exportToPDF(appo)} className="text-[11px] text-blue-500 font-bold hover:text-blue-400">PDF</button>

              {appo.datosCliente?.contactPhone && (
              <a 
                href={`https://wa.me/${appo.datosCliente.contactPhone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(appo.clientName)},%20te%20contacto%20de%20Materiales%20Reutilizables%20para%20confirmar%20tu%20cita%20el%20día%20${format(new Date(appo.date), "d 'de' MMMM", { locale: es })}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-green-400 font-bold hover:text-green-300 border border-green-400/30 px-2 py-1 rounded bg-green-400/10 transition-colors"
              >
                WHATSAPP
              </a>
            )}
            </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer theme="dark" position="bottom-right" />
    </div>
  );
};

export default CalendarCard;