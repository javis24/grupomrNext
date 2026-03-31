import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { 
    FiArrowLeft, FiChevronRight, FiSearch, FiUser, 
    FiCheckCircle, FiDollarSign, FiCalendar, FiTruck 
} from 'react-icons/fi';

// Componente del Icono de Pallet personalizado
const PalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
    <path d="M2 20h20M2 16h20M2 12h20" />
    <path d="M4 12v8M12 12v8M20 12v8" />
    <path d="M2 12v8M22 12v8" />
  </svg>
);

const SalesPage = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [formValues, setFormValues] = useState({
        concepto: '', equipo: '', cantidad: '', precioUnitario: '',
        transporte: '', estadoPago: '', fechaOperacion: '', observaciones: ''
    });

    // Configuración de Unidades con el nuevo estándar de diseño
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

    useEffect(() => { fetchClients(); }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/clients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
        } catch (err) { toast.error("Error al cargar clientes"); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleReturnToUnits = () => {
        setSelectedCategory(null);
        setSelectedClient(null);
        setFormValues({ concepto: '', equipo: '', cantidad: '', precioUnitario: '', transporte: '', estadoPago: '', fechaOperacion: '', observaciones: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClient) {
            toast.error("Debe seleccionar un cliente");
            return;
        }

        const dataToSend = { ...formValues, unitBusiness: selectedCategory, clientId: selectedClient.id };

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/salesbussines', dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("¡Venta registrada con éxito!");
            handleReturnToUnits();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error en el servidor");
        }
    };

    const filteredClients = clients.filter(c => 
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8 font-sans">
            <ToastContainer theme="dark" />
            <div className="max-w-7xl mx-auto">
                
                {!selectedCategory ? (
                    <div className="animate-in fade-in duration-500">
                        <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase italic tracking-tighter text-blue-500">Registrar Venta</h1>
                        <p className="text-blue-400 text-xs font-bold tracking-[0.4em] uppercase mb-10">Módulo de Operaciones Comerciales</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {units.map((u) => (
                                <div key={u.name} onClick={() => setSelectedCategory(u.name)}
                                    className="bg-[#1f2937] p-10 rounded-[2.5rem] border border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:translate-y-[-8px] shadow-2xl group relative overflow-hidden"
                                >
                                    <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${u.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                                    
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center text-6xl">
                                            {typeof u.icon === 'string' 
                                                ? u.icon 
                                                : <div className="text-blue-500 p-2 scale-90">{u.icon}</div>
                                            }
                                        </div>
                                        <h2 className="text-3xl font-black uppercase text-white mb-2">{u.name}</h2>
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                                            <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Registrar nueva</span>
                                        </div>
                                    </div>
                                    <FiChevronRight className="absolute right-8 bottom-8 text-gray-700 group-hover:text-blue-500 transition-all" size={32} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-5 duration-500">
                        {/* Header de Gestión */}
                        <div className="flex items-center gap-5 mb-10">
                            <button onClick={handleReturnToUnits} className="bg-[#1f2937] p-4 rounded-2xl hover:bg-blue-600 transition-all border border-gray-700 shadow-lg">
                                <FiArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                                    Venta: <span className="text-blue-500">{selectedCategory}</span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* PANEL IZQUIERDO: CLIENTES (Mismo diseño de card) */}
                            <div className="w-full lg:w-1/3">
                                <div className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700 shadow-2xl h-full">
                                    <h2 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <FiUser /> Seleccionar Cliente
                                    </h2>
                                    <div className="relative mb-6">
                                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar cliente..." 
                                            className="w-full bg-[#0e1624] border border-gray-700 rounded-2xl p-4 pl-12 text-sm outline-none focus:border-blue-500 transition-all" 
                                            onChange={(e) => setSearchTerm(e.target.value)} 
                                        />
                                    </div>
                                    
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredClients.map(client => (
                                            <div 
                                                key={client.id} 
                                                onClick={() => setSelectedClient(client)} 
                                                className={`p-5 rounded-2xl cursor-pointer transition-all border ${selectedClient?.id === client.id ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/20' : 'bg-[#0e1624] border-gray-800 hover:border-gray-600'}`}
                                            >
                                                <p className="font-black text-xs uppercase tracking-tight">{client.fullName}</p>
                                                <p className={`text-[10px] mt-1 uppercase font-bold ${selectedClient?.id === client.id ? 'text-blue-100' : 'text-gray-500'}`}>{client.companyName}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* PANEL DERECHO: FORMULARIO (Estilo moderno) */}
                            <div className="flex-1">
                                {!selectedClient ? (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-[#1f2937]/30 rounded-[2.5rem] border-2 border-dashed border-gray-800 text-gray-600">
                                        <FiUser size={48} className="mb-4 opacity-20" />
                                        <p className="uppercase font-black text-xs tracking-widest">Selecciona un cliente para continuar</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="bg-[#1f2937] p-10 rounded-[2.5rem] border border-gray-700 shadow-2xl space-y-8 animate-in zoom-in-95">
                                        <div className="border-b border-gray-800 pb-6">
                                            <h3 className="text-xl font-black uppercase italic">Detalles de Operación</h3>
                                            <p className="text-blue-500 text-[10px] font-bold uppercase mt-1 tracking-widest">Cliente: {selectedClient.fullName}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Concepto</label>
                                                {selectedCategory === "Servicios" ? (
                                                    <select name="concepto" value={formValues.concepto} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all appearance-none" required>
                                                        <option value="">Seleccionar...</option>
                                                        {conceptosServicios.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                ) : (
                                                    <input type="text" name="concepto" value={formValues.concepto} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all" placeholder="Nombre del producto..." required />
                                                )}
                                            </div>

                                            {selectedCategory === "Servicios" && (
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Unidad / Equipo</label>
                                                    <select name="equipo" value={formValues.equipo} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all appearance-none" required>
                                                        <option value="">Seleccionar...</option>
                                                        {equiposServicios.map(e => <option key={e} value={e}>{e}</option>)}
                                                    </select>
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Cantidad / Peso</label>
                                                <input type="number" name="cantidad" value={formValues.cantidad} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all" placeholder="0.00" required />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest flex items-center gap-1"><FiDollarSign className="text-green-500"/> Precio Unitario</label>
                                                <input type="number" name="precioUnitario" value={formValues.precioUnitario} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-green-500 text-green-400 font-bold transition-all" placeholder="$0.00" required />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest flex items-center gap-1"><FiTruck className="text-orange-500"/> Transporte</label>
                                                <select name="transporte" value={formValues.transporte} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all appearance-none" required>
                                                    <option value="">Seleccionar...</option>
                                                    {opcionesTransporte.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest flex items-center gap-1"><FiCheckCircle className="text-blue-500"/> Estado de Pago</label>
                                                <select name="estadoPago" value={formValues.estadoPago} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all appearance-none" required>
                                                    <option value="">Seleccionar...</option>
                                                    {opcionesPago.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest flex items-center gap-1"><FiCalendar className="text-red-500"/> Fecha Operación</label>
                                                <input type="date" name="fechaOperacion" value={formValues.fechaOperacion} onChange={handleInputChange} className="bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 text-white transition-all" required />
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row gap-4">
                                            <button type="button" onClick={() => setSelectedClient(null)} className="flex-1 px-8 py-5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-400 font-black text-xs uppercase tracking-widest transition-all">Cancelar</button>
                                            <button type="submit" className="flex-[2] px-8 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-900/40 text-xs uppercase tracking-[0.2em] transition-all active:scale-95">Finalizar Registro de Venta</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesPage;