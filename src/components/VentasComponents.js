import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import jwt from 'jsonwebtoken';

import { 
    FiArrowLeft, FiChevronRight, FiSearch, FiUser, 
    FiCheckCircle, FiDollarSign, FiCalendar, FiTruck,
    FiEdit2, FiTrash2, FiList, FiPlus, FiMessageSquare
} from 'react-icons/fi';

const PalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
    <path d="M2 20h20M2 16h20M2 12h20" />
    <path d="M4 12v8M12 12v8M20 12v8" />
    <path d="M2 12v8M22 12v8" />
  </svg>
);

const SalesPage = () => {
    const [clients, setClients] = useState([]);
    const [sales, setSales] = useState([]);
    const [view, setView] = useState('units'); // 'units', 'form', 'history'
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [formValues, setFormValues] = useState({
        concepto: '', equipo: '', cantidad: '', precioUnitario: '',
        transporte: '', estadoPago: '', fechaOperacion: '', observaciones: ''
    });

    const units = [
        { name: 'Servicios', icon: '🚛', color: 'from-blue-500 to-indigo-600' },
        { name: 'Empaques', icon: '📦', color: 'from-orange-400 to-red-500' },
        { name: 'Tarimas', icon: <PalletIcon />, color: 'from-amber-600 to-yellow-700' },
        { name: 'Alimentos', icon: '🐖', color: 'from-green-400 to-emerald-600' },
        { name: 'Plasticos', icon: '♻️', color: 'from-cyan-500 to-blue-600' },
        { name: 'Composta', icon: '🌱', color: 'from-lime-500 to-green-700' }
    ];

    const conceptosServicios = ["Renta de equipo", "Recolección", "Disposición final", "Destrucción"];
    const equiposServicios = ["Ruta 3 mts cúbicos", "Ruta 6 mts cúbicos", "Contenedor 30 mts cúbicos", "Contenedor 15 mts cúbicos", "Contenedor 8 mts cúbicos", "Compactador", "Jaula"];
    const opcionesTransporte = ["Entrega a domicilio sin costo", "Entrega a domicilio con costo", "Recolección por el cliente"];
    const opcionesPago = ["Anticipado", "Contado", "Crédito", "Pago parcial", "Sin costo"];

    useEffect(() => { 
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decoded = jwt.decode(token);
            if (decoded) {
                setCurrentUser(decoded);
                console.log("Usuario autenticado:", decoded.name);
            }
        } catch (e) { 
            console.error("Error al leer el token:", e); 
        }
    }
    fetchClients(); 
    fetchSales();
}, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/clients', { headers: { Authorization: `Bearer ${token}` } });
            setClients(res.data);
        } catch (err) { toast.error("Error al cargar clientes"); }
    };

    const fetchSales = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/salesbussines', { headers: { Authorization: `Bearer ${token}` } });
            setSales(res.data);
        } catch (err) { console.error("Error al cargar ventas"); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleEdit = (sale) => {
        setIsEditing(true);
        setEditingId(sale.id);
        setSelectedCategory(sale.unitBusiness);
        
        // Cargar cliente vinculado
        const client = clients.find(c => c.id === sale.clientId);
        setSelectedClient(client || { id: sale.clientId, fullName: 'Cliente actual' });
        
        setFormValues({
            concepto: sale.concepto,
            equipo: sale.equipo || '',
            cantidad: sale.cantidad,
            precioUnitario: sale.precioUnitario,
            transporte: sale.transporte,
            estadoPago: sale.estadoPago,
            fechaOperacion: sale.fechaOperacion ? sale.fechaOperacion.split('T')[0] : '',
            observaciones: sale.observaciones || ''
        });
        setView('form');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro de venta?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/salesbussines/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.info("Venta eliminada correctamente");
            fetchSales();
        } catch (err) { toast.error("Error al eliminar"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!selectedClient) return toast.error("Seleccione un cliente");

        const dataToSend = { 
            ...formValues, 
            unitBusiness: selectedCategory, 
            clientId: selectedClient.id 
        };

        try {
            if (isEditing) {
                await axios.put(`/api/salesbussines/${editingId}`, dataToSend, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("¡Venta actualizada!");
            } else {
                await axios.post('/api/salesbussines', dataToSend, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("¡Venta registrada!");
            }
            resetAll();
            fetchSales();
        } catch (err) { toast.error(err.response?.data?.message || "Error en la operación"); }
    };

    const resetAll = () => {
        setView('units');
        setSelectedCategory(null);
        setSelectedClient(null);
        setIsEditing(false);
        setEditingId(null);
        setFormValues({ concepto: '', equipo: '', cantidad: '', precioUnitario: '', transporte: '', estadoPago: '', fechaOperacion: '', observaciones: '' });
    };

    return (
        <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8 font-sans">
            <ToastContainer theme="dark" />
            <div className="max-w-7xl mx-auto">
                
                {/* HEADER DINÁMICO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-blue-500">
                            {view === 'history' ? 'Historial de Ventas' : 'Nueva Operación'}
                        </h1>
                        <p className="text-blue-400 text-xs font-bold tracking-[0.3em] uppercase">
                            Sesión: {currentUser?.name || 'Usuario'} | {currentUser?.role || 'Asesor'}
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => { resetAll(); setView('units'); }} 
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view !== 'history' ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'bg-gray-800'}`}>
                            <FiPlus /> Registrar
                        </button>
                        <button onClick={() => setView('history')} 
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view === 'history' ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'bg-gray-800'}`}>
                            <FiList /> Mis Ventas
                        </button>
                    </div>
                </div>

                {/* VISTA 1: CATEGORÍAS */}
                {view === 'units' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                        {units.map((u) => (
                            <div key={u.name} onClick={() => { setSelectedCategory(u.name); setView('form'); }}
                                className="bg-[#1f2937] p-10 rounded-[2.5rem] border border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:translate-y-[-8px] shadow-2xl group relative overflow-hidden"
                            >
                                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${u.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 mb-6 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">{u.icon}</div>
                                    <h2 className="text-3xl font-black uppercase text-white mb-2">{u.name}</h2>
                                    <div className="flex items-center gap-3">
                                        <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                                        <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Seleccionar</span>
                                    </div>
                                </div>
                                <FiChevronRight className="absolute right-8 bottom-8 text-gray-700 group-hover:text-blue-500 transition-all" size={32} />
                            </div>
                        ))}
                    </div>
                )}

                {/* VISTA 2: FORMULARIO REGISTRO/EDICIÓN */}
                {view === 'form' && (
                    <div className="flex flex-col lg:flex-row gap-8 animate-in slide-in-from-bottom-5">
                        {/* Selector de Cliente */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700 shadow-2xl">
                                <h2 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2"><FiUser /> Cliente</h2>
                                <div className="relative mb-6">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="text" placeholder="Buscar cliente..." className="w-full bg-[#0e1624] border border-gray-700 rounded-2xl p-4 pl-12 text-sm outline-none focus:border-blue-500" onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {clients.filter(c => c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())).map(client => (
                                        <div key={client.id} onClick={() => setSelectedClient(client)} 
                                            className={`p-5 rounded-2xl cursor-pointer transition-all border ${selectedClient?.id === client.id ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-[#0e1624] border-gray-800 hover:border-gray-600'}`}>
                                            <p className="font-black text-xs uppercase">{client.fullName}</p>
                                            <p className="text-[9px] text-gray-500 uppercase">{client.companyName}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Campos del Formulario */}
                        <div className="flex-1">
                            {selectedClient ? (
                                <form onSubmit={handleSubmit} className="bg-[#1f2937] p-10 rounded-[2.5rem] border border-gray-700 shadow-2xl space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-800 pb-6">
                                        <h3 className="text-xl font-black uppercase italic">{isEditing ? '✏️ Editando' : '📝 Nueva'} Venta</h3>
                                        <span className="px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest">{selectedCategory}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Concepto</label>
                                            {selectedCategory === "Servicios" ? (
                                                <select name="concepto" value={formValues.concepto} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm" required>
                                                    <option value="">Seleccionar...</option>
                                                    {conceptosServicios.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            ) : <input type="text" name="concepto" value={formValues.concepto} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm" placeholder="Ej: Tarima Reforzada" required />}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Cantidad</label>
                                            <input type="number" name="cantidad" value={formValues.cantidad} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm" required />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Precio Unitario</label>
                                            <div className="relative">
                                                <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                                                <input type="number" step="0.01" name="precioUnitario" value={formValues.precioUnitario} onChange={handleInputChange} className="w-full bg-[#0e1624] border border-gray-700 rounded-2xl p-4 pl-10 text-sm text-green-400 font-bold" required />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Estado de Pago</label>
                                            <select name="estadoPago" value={formValues.estadoPago} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm" required>
                                                <option value="">Seleccionar...</option>
                                                {opcionesPago.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Fecha Operación</label>
                                            <input type="date" name="fechaOperacion" value={formValues.fechaOperacion} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm" required />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Transporte</label>
                                            <select name="transporte" value={formValues.transporte} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm" required>
                                                <option value="">Seleccionar...</option>
                                                {opcionesTransporte.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Observaciones</label>
                                        <textarea name="observaciones" value={formValues.observaciones} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm resize-none h-24" placeholder="Notas adicionales..." />
                                    </div>

                                    <div className="pt-6 flex gap-4">
                                        <button type="button" onClick={resetAll} className="flex-1 bg-gray-800 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                                        <button type="submit" className="flex-[2] bg-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/40">
                                            {isEditing ? 'Actualizar Registro' : 'Finalizar Venta'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-[#1f2937]/30 rounded-[2.5rem] border-2 border-dashed border-gray-800 text-gray-600">
                                    <FiUser size={48} className="mb-4 opacity-20" />
                                    <p className="uppercase font-black text-xs tracking-widest">Selecciona un cliente de la lista</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VISTA 3: HISTORIAL (CARDS MODERNAS) */}
                {view === 'history' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sales.map(sale => (
                                <div key={sale.id} className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700 shadow-xl hover:border-blue-500/50 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl text-2xl">
                                            {units.find(u => u.name === sale.unitBusiness)?.icon || <FiDollarSign />}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(sale)} className="p-3 bg-gray-800 rounded-xl hover:text-green-400 transition-colors"><FiEdit2 size={16}/></button>
                                            <button onClick={() => handleDelete(sale.id)} className="p-3 bg-gray-800 rounded-xl hover:text-red-400 transition-colors"><FiTrash2 size={16}/></button>
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-xl font-black uppercase text-white truncate">{sale.concepto}</h4>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">Unidad: {sale.unitBusiness}</p>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <FiUser className="text-blue-500" /> {sale.Client?.fullName || 'S/N Cliente'}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <FiCalendar className="text-blue-500" /> {new Date(sale.fechaOperacion).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
                                        <div className="bg-[#0e1624] p-3 rounded-2xl border border-gray-800">
                                            <p className="text-[8px] text-gray-600 font-black uppercase">Monto Total</p>
                                            <p className="text-lg font-black text-green-400">${(sale.cantidad * sale.precioUnitario).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-[#0e1624] p-3 rounded-2xl border border-gray-800 text-center">
                                            <p className="text-[8px] text-gray-600 font-black uppercase">Estado</p>
                                            <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase">{sale.estadoPago}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {sales.length === 0 && (
                            <div className="text-center py-32 bg-[#1f2937]/50 rounded-[3rem] border-2 border-dashed border-gray-800">
                                <p className="text-gray-600 font-black uppercase tracking-widest text-xl italic">Aún no hay ventas en tu historial</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesPage;