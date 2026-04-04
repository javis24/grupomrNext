import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jwt from 'jsonwebtoken';


const Calendar = lazy(() => import('react-calendar'));
import 'react-calendar/dist/Calendar.css';

const CalendarCard = () => {
  const router = useRouter();

  // --- ESTADOS ---
 const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientStatus, setClientStatus] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [comments, setComments] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userRole, setUserRole] = useState('');

const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');
      
      const decoded = jwt.decode(token);
      setUserRole(decoded.role);

      // 1. Petición de CITAS (Siempre se ejecuta)
      const resAppo = await axios.get('/api/appointments', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAppointments(resAppo.data || []);

      // 2. Lógica de USUARIOS (Solo Admin puede ver la lista completa)
      if (decoded.role === 'admin' || decoded.role === 'gerencia') {
        const resUsers = await axios.get('/api/users', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setUsers(resUsers.data);
      } else {
        // Si es VENDEDOR, se auto-asigna a sí mismo y no pide la lista (evita el 403)
        setUsers([{ id: decoded.id, name: decoded.name }]);
        setSelectedUser(decoded.id.toString());
      }

    } catch (err) {
      console.error("Fetch Error:", err);
      // Solo mostramos error si no es un 403 (que ya manejamos arriba)
      if (err.response?.status !== 403) {
        toast.error('Sesión expirada o error de conexión');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);


  useEffect(() => { fetchData(); }, [fetchData]);

  // --- BÚSQUEDA AUTOCOMPLETADO ---
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
      } catch (err) { console.error("Error búsqueda"); }
    };
    const timeoutId = setTimeout(triggerSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [clientName]);

  // --- HANDLERS ---
 const handleSaveAppointment = async () => {
    // Si no es admin, forzamos que el selectedUser sea el del vendedor logueado
    let finalUser = selectedUser;
    if (userRole !== 'admin') {
        const decoded = jwt.decode(localStorage.getItem('token'));
        finalUser = decoded.id;
    }

    if (!clientName || !clientStatus || !finalUser || !appointmentTime) {
      return toast.warning('Completa los campos obligatorios');
    }
    
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        date: date.toISOString(), 
        clientName, 
        clientStatus, 
        assignedTo: parseInt(finalUser), 
        appointmentTime, 
        comments 
      };

      if (editingAppointment) {
        await axios.put(`/api/appointments/${editingAppointment.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cita actualizada');
      } else {
        const response = await axios.post('/api/appointments', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(prev => [...prev, response.data]);
        toast.success('Cita agendada');
      }
      
      fetchData(); 
      resetForm();
    } catch (e) { 
      toast.error('Error al procesar la solicitud'); 
    }
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

  const loadToEdit = (appo) => {
    setEditingAppointment(appo);
    setClientName(appo.clientName);
    setClientStatus(appo.clientStatus);
    setSelectedUser(appo.assignedTo || '');
    setAppointmentTime(appo.appointmentTime || '');
    setComments(appo.comments || '');
    setDate(new Date(appo.date));
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

 const resetForm = () => {
    setClientName(''); setClientStatus(''); 
    if (userRole === 'admin') setSelectedUser('');
    setAppointmentTime(''); setComments(''); setEditingAppointment(null);
  };

  const exportToPDF = (appointment) => {
    const doc = new jsPDF();
    doc.text("Resumen de Cita", 20, 20);
    doc.autoTable({
      startY: 30,
      head: [['Concepto', 'Detalle']],
      body: [
        ["Fecha", format(new Date(appointment.date), 'PPP', { locale: es })],
        ["Horario", appointment.appointmentTime || 'N/A'],
        ["Cliente", appointment.clientName],
        ["Asesor", appointment.assignedUser?.name || 'N/A'],
        ["Estatus", appointment.clientStatus],
        ["Comentarios", appointment.comments || '---'],
      ],
    });
    doc.save(`Cita_${appointment.clientName}.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row p-2 md:p-6 bg-[#0e1624] gap-6 min-h-screen text-white font-sans">
      <div className="w-full lg:w-7/12 space-y-6">
        <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📅 Calendario de Actividades</h2>
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-700 rounded-lg"></div>}>
            <Calendar onChange={setDate} value={date} locale="es-ES" className="w-full rounded-lg border-none text-black shadow-inner" />
          </Suspense>
        </div>

        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-400">
            {editingAppointment ? '✏️ Modificar Cita' : '➕ Nueva Cita'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col relative">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-1">Cliente</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} onFocus={() => clientName.length >= 2 && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
              {showSuggestions && (
                <ul className="absolute z-50 w-full top-full mt-1 bg-[#1f2937] border border-gray-600 rounded-lg shadow-2xl max-h-40 overflow-y-auto">
                  {clientSuggestions.map(c => <li key={c.id} onClick={() => { setClientName(c.fullName); setShowSuggestions(false); }} className="p-2 hover:bg-blue-600 cursor-pointer text-sm border-b border-gray-700 uppercase">{c.fullName}</li>)}
                </ul>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-1">Asesor</label>
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-1">Horario</label>
                <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} className="bg-[#374151] border border-gray-600 rounded-lg p-3 text-white" />
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-1">Status</label>
                <input type="text" value={clientStatus} onChange={(e) => setClientStatus(e.target.value)} className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex flex-col md:col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-1">Notas</label>
                <textarea value={comments} onChange={(e) => setComments(e.target.value)} className="bg-[#374151] border border-gray-600 rounded-lg p-3 outline-none h-20 resize-none" />
            </div>
            
            <div className="md:col-span-2 flex flex-col gap-2">
              <button 
                onClick={handleSaveAppointment} 
                className={`p-3 rounded-lg font-bold transition-all ${editingAppointment ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {editingAppointment ? 'Guardar Cambios' : 'Confirmar Cita'}
              </button>
              {editingAppointment && (
                <button onClick={resetForm} className="text-gray-400 hover:text-white underline text-sm">Cancelar Edición</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-5/12">
        <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 h-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
          <h2 className="text-xl font-bold mb-4">Próximas Citas</h2>
          <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
            {appointments.length === 0 ? (
                <div className="text-center py-10 text-gray-500 italic text-sm border border-dashed border-gray-700 rounded-lg">No hay citas registradas.</div>
            ) : [...appointments].reverse().map(appo => (
              <div key={appo.id} className="p-4 bg-[#2d3748] rounded-lg border-l-4 border-blue-500 group shadow-md transition-all hover:bg-[#323d4e]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-blue-400 font-bold">{format(new Date(appo.date), "eeee d 'de' MMMM", { locale: es })}</p>
                        {appo.appointmentTime && <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2 rounded">🕒 {appo.appointmentTime}</span>}
                    </div>
                    <h4 className="font-bold text-lg mt-1 uppercase leading-tight">{appo.clientName}</h4>
                    <p className="text-xs text-gray-400">👤 {appo.assignedUser?.name || 'Sin asesor'}</p>
                    {appo.comments && <p className="text-[11px] text-gray-500 mt-2 italic line-clamp-2">"{appo.comments}"</p>}
                  </div>
                  <span className="text-[9px] uppercase font-black bg-gray-900 px-2 py-1 rounded text-blue-300 border border-blue-500/30">{appo.clientStatus}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => loadToEdit(appo)} className="text-[10px] text-yellow-500 font-bold uppercase hover:underline">Editar</button>
                  <button onClick={() => handleDeleteAppointment(appo.id)} className="text-[10px] text-red-500 font-bold uppercase hover:underline">Eliminar</button>
                  <button onClick={() => exportToPDF(appo)} className="text-[10px] text-blue-500 font-bold uppercase hover:underline">PDF</button>

                  {appo.datosCliente?.contactPhone && (
                    <a 
                        href={`https://wa.me/52${appo.datosCliente.contactPhone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(appo.clientName)}...`} 
                        target="_blank" 
                        className="text-[10px] text-green-400 font-bold uppercase hover:underline"
                    >WhatsApp</a>
                  )}

                  <button 
                    onClick={() => router.push({ pathname: '/prospectos', query: { name: appo.clientName, phone: appo.datosCliente?.contactPhone || '' } })}
                    className="text-[10px] bg-purple-600/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded hover:bg-purple-600 hover:text-white transition-all font-bold uppercase"
                  >+ Prospecto</button>

                  <button 
                    onClick={() => router.push({ pathname: '/cotizacion', query: { client: appo.clientName, phone: appo.datosCliente?.contactPhone || '' } })}
                    className="text-[10px] bg-orange-600/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded hover:bg-orange-600 hover:text-white transition-all font-bold uppercase"
                  >+ Cotizar</button>
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