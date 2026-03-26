import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import jwt from 'jsonwebtoken';
import { 
    FiSearch, FiPlus, FiEdit2, FiTrash2, FiArrowLeft,
    FiChevronRight, FiUser, FiMapPin, FiBriefcase, FiX, FiFileText, FiChevronLeft 
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';

const customStyles = {
    content: {
        top: '50%', left: '50%', right: 'auto', bottom: 'auto',
        marginRight: '-50%', transform: 'translate(-50%, -50%)',
        backgroundColor: '#1f2937', border: '1px solid #374151',
        borderRadius: '1.5rem', padding: '20px', width: '95%',
        maxWidth: '1100px', maxHeight: '90vh',
    },
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1000 }
};

export default function ClientList() {
    const [clients, setClients] = useState([]);
    const [view, setView] = useState('unidades'); 
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [search, setSearch] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 6;

    const unidadesNegocio = [
        { name: 'Servicios', icon: '🛠️', color: 'from-blue-500 to-indigo-600' },
        { name: 'Empaques', icon: '📦', color: 'from-orange-400 to-red-500' },
        { name: 'Tarimas', icon: '🪵', color: 'from-amber-600 to-yellow-700' },
        { name: 'Alimentos', icon: '🍎', color: 'from-green-400 to-emerald-600' },
        { name: 'Plasticos', icon: '♻️', color: 'from-cyan-500 to-blue-600' },
        { name: 'Composta', icon: '🌱', color: 'from-lime-500 to-green-700' }
    ];

  const initialClientState = {
    fullName: '',
    companyName: '',
    businessTurn: '',
    address: '',
    contactName: '',
    companyPhone: '',
    contactPhone: '',
    email: '',
    position: '',
    planta: '',
    producto: '',
    assignedUser: '',
    billingContactName: '',
    billingPhone: '',
    billingEmail: '',
    usoCFDI: '',
    paymentMethod: '',
    paymentConditions: '',
    billingDepartment: '',
};

    const [newClient, setNewClient] = useState(initialClientState);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchClients(), fetchUsers()]);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/clients', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setClients(Array.isArray(response.data) ? response.data : []);
        } catch (error) { 
            console.error(error);
            toast.error('Error al cargar clientes'); 
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
            setActiveUsers(res.data);
        } catch (e) { console.error("Error usuarios", e); }
    };

    // --- FUNCIÓN FALTANTE: handleSubmit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (selectedClient) {
                // EDITAR CLIENTE
                await axios.put(`/api/clients/${selectedClient.id}`, newClient, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                toast.success("Cliente actualizado con éxito");
            } else {
                // CREAR CLIENTE NUEVO
                await axios.post('/api/clients', newClient, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                toast.success("Nuevo cliente registrado");
            }
            fetchClients();
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar la solicitud");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Confirmas la eliminación definitiva de este cliente?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/clients/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setClients(clients.filter(c => c.id !== id));
            toast.success("Registro eliminado");
        } catch (e) { toast.error("Error al eliminar"); }
    };

    const openModal = (client = null) => {
        if (client) {
            setSelectedClient(client);
            setNewClient(client);
        } else {
            setSelectedClient(null);
            setNewClient({ ...initialClientState, planta: selectedUnit || '' });
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedClient(null);
        setNewClient(initialClientState);
    };

    const selectUnit = (unitName) => {
        setSelectedUnit(unitName);
        setView('listado');
        setCurrentPage(1);
    };

    const filteredClients = clients.filter((c) => {
        const clientUnit = (c.planta || '').trim().toLowerCase();
        const targetUnit = (selectedUnit || '').trim().toLowerCase();
        const matchUnit = clientUnit === targetUnit;
        const matchSearch = (c.companyName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (c.fullName || '').toLowerCase().includes(search.toLowerCase());
        return matchUnit && matchSearch;
    });

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const currentClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (isLoading) return (
        <div className="min-h-screen bg-[#0e1624] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <ToastContainer theme="dark" />
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div className="flex items-center gap-4">
                    {view === 'listado' && (
                        <button onClick={() => setView('unidades')} className="bg-[#1f2937] p-3 rounded-2xl hover:bg-blue-600 transition-all text-white border border-gray-700">
                            <FiArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">
                            {view === 'unidades' ? 'Grupo MR' : selectedUnit}
                        </h1>
                    </div>
                </div>
                <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg">
                    <FiPlus className="inline mr-2"/> Registrar Cliente
                </button>
            </div>

            {view === 'unidades' ? (
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unidadesNegocio.map((u) => {
                        const count = clients.filter(c => (c.planta || '').trim().toLowerCase() === u.name.toLowerCase()).length;
                        return (
                            <div key={u.name} onClick={() => selectUnit(u.name)}
                                className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:bg-[#252f3f] group shadow-2xl relative overflow-hidden"
                            >
                                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${u.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                                <div className="relative z-10">
                                    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">{u.icon}</div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight mb-2">{u.name}</h2>
                                    <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">{count} Clientes</span>
                                </div>
                                <FiChevronRight className="absolute right-8 bottom-8 text-gray-700 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" size={30} />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-[#1f2937] p-4 rounded-3xl border border-gray-700 flex items-center shadow-xl">
                        <FiSearch className="text-gray-500 mx-4" size={20} />
                        <input type="text" placeholder={`Buscar en ${selectedUnit}...`} className="bg-transparent w-full outline-none text-white font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentClients.map((client) => (
                            <div key={client.id} className="bg-[#1f2937] rounded-3xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all shadow-lg flex flex-col justify-between group">
                                <div>
                                    <h3 className="text-xl font-black uppercase truncate text-white mb-1">{client.companyName}</h3>
                                    <p className="text-blue-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em]">{client.fullName}</p>
                                    <div className="space-y-3 mb-6 text-xs text-gray-400 border-t border-gray-800 pt-4">
                                        <div className="flex items-center gap-2"><FiUser className="text-blue-500" /> {client.contactName}</div>
                                        <div className="flex items-center gap-2"><FiMapPin className="text-blue-500" /> {client.address}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-800">
                                    <button onClick={() => openModal(client)} className="bg-gray-800 hover:bg-blue-600 p-3 rounded-xl transition-all flex justify-center text-white"><FiEdit2 /></button>
                                    <button className="bg-gray-800 hover:bg-yellow-600 p-3 rounded-xl transition-all flex justify-center text-white"><FiFileText /></button>
                                    <button onClick={() => handleDelete(client.id)} className="bg-gray-800 hover:bg-red-600 p-3 rounded-xl transition-all flex justify-center text-white"><FiTrash2 /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-10">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="bg-[#1f2937] p-3 rounded-xl disabled:opacity-20 border border-gray-700"><FiChevronLeft /></button>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Página {currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="bg-[#1f2937] p-3 rounded-xl disabled:opacity-20 border border-gray-700"><FiChevronRight /></button>
                        </div>
                    )}
                </div>
            )}

          <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles}>
    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
            <h2 className="text-2xl font-black uppercase italic text-white">
                {selectedClient ? '✏️ Editar Cliente' : '🚀 Nuevo Registro'}
            </h2>
            <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">
                Unidad: {newClient.planta || 'Sin asignar'}
            </p>
        </div>
        <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
            <FiX size={28} />
        </button>
    </div>

    <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh] pr-4 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA 1: DATOS FISCALES Y EMPRESA */}
            <div className="space-y-4">
                <h3 className="text-blue-500 text-[11px] font-black uppercase tracking-widest border-l-4 border-blue-500 pl-2">Información de Empresa</h3>
                <ModalInput label="Razón Social (Nombre Completo)" value={newClient.fullName} onChange={(v) => setNewClient({...newClient, fullName: v})} required />
                <ModalInput label="Nombre Comercial" value={newClient.companyName} onChange={(v) => setNewClient({...newClient, companyName: v})} required />
                <ModalInput label="Giro Comercial" value={newClient.businessTurn} onChange={(v) => setNewClient({...newClient, businessTurn: v})} required />
                <ModalInput label="Dirección Fiscal" value={newClient.address} onChange={(v) => setNewClient({...newClient, address: v})} required />
                <ModalInput label="Teléfono de Empresa" value={newClient.companyPhone} onChange={(v) => setNewClient({...newClient, companyPhone: v})} />
            </div>

            {/* COLUMNA 2: CONTACTO Y OPERACIÓN */}
            <div className="space-y-4">
                <h3 className="text-green-500 text-[11px] font-black uppercase tracking-widest border-l-4 border-green-500 pl-2">Contacto y Logística</h3>
                <ModalInput label="Nombre de Contacto Directo" value={newClient.contactName} onChange={(v) => setNewClient({...newClient, contactName: v})} />
                <ModalInput label="Cargo / Puesto" value={newClient.position} onChange={(v) => setNewClient({...newClient, position: v})} />
                <ModalInput label="Teléfono Directo" value={newClient.contactPhone} onChange={(v) => setNewClient({...newClient, contactPhone: v})} />
                <ModalInput label="Email de Contacto" type="email" value={newClient.email} onChange={(v) => setNewClient({...newClient, email: v})} />
                <ModalInput label="Producto de Interés" value={newClient.producto} onChange={(v) => setNewClient({...newClient, producto: v})} />
                
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Planta</label>
                        <select 
                            value={newClient.planta} 
                            onChange={(e) => setNewClient({...newClient, planta: e.target.value})}
                            className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500"
                        >
                            <option value="">Seleccionar...</option>
                            {unidadesNegocio.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Vendedor</label>
                        <select 
                            value={newClient.assignedUser} 
                            onChange={(e) => setNewClient({...newClient, assignedUser: e.target.value})}
                            className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500"
                        >
                            <option value="">Asignar...</option>
                            {activeUsers.map(u => <option key={u.id} value={u.email}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* COLUMNA 3: DATOS DE FACTURACIÓN */}
            <div className="space-y-4 bg-gray-800/30 p-4 rounded-2xl border border-gray-700">
                <h3 className="text-yellow-500 text-[11px] font-black uppercase tracking-widest border-l-4 border-yellow-500 pl-2">Departamento de Pagos</h3>
                <ModalInput label="Depto. Facturación" value={newClient.billingDepartment} onChange={(v) => setNewClient({...newClient, billingDepartment: v})} />
                <ModalInput label="Contacto de Pagos" value={newClient.billingContactName} onChange={(v) => setNewClient({...newClient, billingContactName: v})} />
                <ModalInput label="Teléfono de Pagos" value={newClient.billingPhone} onChange={(v) => setNewClient({...newClient, billingPhone: v})} />
                <ModalInput label="Email de Facturas" type="email" value={newClient.billingEmail} onChange={(v) => setNewClient({...newClient, billingEmail: v})} />
                <ModalInput label="Uso de CFDI" value={newClient.usoCFDI} onChange={(v) => setNewClient({...newClient, usoCFDI: v})} />
                <ModalInput label="Método de Pago" value={newClient.paymentMethod} onChange={(v) => setNewClient({...newClient, paymentMethod: v})} />
                <ModalInput label="Condiciones (Días Crédito)" value={newClient.paymentConditions} onChange={(v) => setNewClient({...newClient, paymentConditions: v})} />
            </div>
        </div>

        {/* BOTONES */}
        <div className="mt-10 flex gap-4 sticky bottom-0 bg-[#1f2937] pt-4 border-t border-gray-800">
            <button type="button" onClick={closeModal} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-2xl uppercase text-xs tracking-widest transition-all">
                Cancelar
            </button>
            <button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95">
                {selectedClient ? '💾 Guardar Cambios' : '🚀 Registrar Cliente'}
            </button>
        </div>
    </form>
</Modal>
        </div>
    );
}
const ModalInput = ({ label, value, onChange, type = "text", required = false }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            autoComplete="off"
            className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all text-white placeholder-gray-600 hover:bg-[#162030]"
        />
    </div>
);