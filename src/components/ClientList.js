import React, { useState, useEffect, useMemo } from 'react';
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
    const [currentUser, setCurrentUser] = useState({ id: null, role: '', email: '', name: '' });
    const itemsPerPage = 6;

    const PalletIcon = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <path d="M2 20h20M2 16h20M2 12h20" />
            <path d="M4 12v8M12 12v8M20 12v8" />
            <path d="M2 12v8M22 12v8" />
        </svg>
    );

    const unidadesNegocio = [
        { name: 'Servicios', icon: '🚛', color: 'from-blue-500 to-indigo-600' },
        { name: 'Empaques', icon: '📦', color: 'from-orange-400 to-red-500' },
        { name: 'Tarimas', icon: <PalletIcon />, color: 'from-amber-600 to-yellow-700' },
        { name: 'Alimentos', icon: '🐖', color: 'from-green-400 to-emerald-600' },
        { name: 'Plasticos', icon: '♻️', color: 'from-cyan-500 to-blue-600' },
        { name: 'Composta', icon: '🌱', color: 'from-lime-500 to-green-700' }
    ];

    const initialClientState = {
        fullName: '', companyName: '', businessTurn: '', address: '',
        contactName: '', companyPhone: '', contactPhone: '', email: '',
        position: '', planta: '', producto: '', assignedUser: '',
        billingContactName: '', billingPhone: '', billingEmail: '',
        usoCFDI: '', paymentMethod: '', paymentConditions: '', billingDepartment: '',
    };

    const [newClient, setNewClient] = useState(initialClientState);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwt.decode(token);
                setCurrentUser({ id: decoded.id, role: decoded.role, email: decoded.email, name: decoded.name });
            }
            await Promise.all([fetchClients(), fetchUsers()]);
            setIsLoading(false);
        };
        loadInitialData();
    }, []);

    // RESET PAGINATION ON SEARCH
    useEffect(() => { setCurrentPage(1); }, [search]);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/clients', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setClients(Array.isArray(response.data) ? response.data : []);
        } catch (error) { 
            toast.error('Error al cargar clientes'); 
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const decoded = jwt.decode(token);
            
            // FIX ERROR 403: Si no es admin, no pedimos la lista. Solo nos usamos a nosotros mismos.
            if (decoded.role !== 'admin') {
                setActiveUsers([{ id: decoded.id, name: decoded.name, email: decoded.email }]);
                return;
            }

            const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
            setActiveUsers(res.data);
        } catch (e) { console.error("Error usuarios", e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (selectedClient) {
                await axios.put(`/api/clients/${selectedClient.id}`, newClient, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                toast.success("Cliente actualizado");
            } else {
                await axios.post('/api/clients', newClient, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                toast.success("Nuevo cliente registrado");
            }
            fetchClients();
            closeModal();
        } catch (error) {
            toast.error("Error al procesar la solicitud");
        }
    };

    const handleDelete = async (id) => {
        if (currentUser.role !== 'admin') return toast.error("Solo administradores pueden eliminar");
        if (!window.confirm("¿Confirmas la eliminación?")) return;
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
            // Auto asignar planta y vendedor si es un vendedor el que registra
            setNewClient({ 
                ...initialClientState, 
                planta: selectedUnit || '',
                assignedUser: currentUser.role !== 'admin' ? currentUser.email : ''
            });
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedClient(null);
        setNewClient(initialClientState);
    };

    const filteredClients = useMemo(() => {
        return clients.filter((c) => {
            const clientUnit = (c.planta || '').trim().toLowerCase();
            const targetUnit = (selectedUnit || '').trim().toLowerCase();
            const matchUnit = clientUnit === targetUnit;
            const matchSearch = (c.companyName || '').toLowerCase().includes(search.toLowerCase()) || 
                              (c.fullName || '').toLowerCase().includes(search.toLowerCase());
            return matchUnit && matchSearch;
        });
    }, [clients, selectedUnit, search]);

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const currentClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (isLoading) return (
        <div className="min-h-screen bg-[#0e1624] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

 return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-[#0e1624] min-h-screen text-gray-900 dark:text-white font-sans transition-colors duration-300">
            <ToastContainer theme="colored" />
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div className="flex items-center gap-4">
                    {view === 'listado' && (
                        <button onClick={() => setView('unidades')} className="bg-white dark:bg-[#1f2937] p-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
                            <FiArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-800 dark:text-white">
                        {view === 'unidades' ? 'Cartera de Clientes' : selectedUnit}
                    </h1>
                </div>
                <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2">
                    <FiPlus /> Nuevo Cliente
                </button>
            </div>

            {view === 'unidades' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unidadesNegocio.map((u) => {
                        const count = clients.filter(c => (c.planta || '').trim().toLowerCase() === u.name.toLowerCase()).length;
                        return (
                            <div key={u.name} onClick={() => { setSelectedUnit(u.name); setView('listado'); }}
                                className="bg-white dark:bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:translate-y-[-4px] group shadow-xl relative overflow-hidden h-64 flex flex-col justify-center"
                            >
                                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${u.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 mb-6 flex items-center justify-center text-6xl">
                                        {typeof u.icon === 'string' ? u.icon : <div className="text-blue-600 dark:text-blue-500 scale-90">{u.icon}</div>}
                                    </div>
                                    <h2 className="text-3xl font-black uppercase text-gray-800 dark:text-white">{u.name}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">{count} Registros</span>
                                    </div>
                                </div>
                                <FiChevronRight className="absolute right-8 bottom-8 text-gray-300 dark:text-gray-700 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" size={30} />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-[#1f2937] p-4 rounded-3xl border border-gray-200 dark:border-gray-700 flex items-center shadow-lg transition-colors">
                        <FiSearch className="text-gray-400 dark:text-gray-500 mx-4" size={20} />
                        <input type="text" placeholder={`Buscar en ${selectedUnit}...`} className="bg-transparent w-full outline-none text-gray-900 dark:text-white placeholder:text-gray-400" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentClients.map((client) => (
                            <div key={client.id} className="bg-white dark:bg-[#1f2937] rounded-[2.5rem] border border-gray-200 dark:border-gray-700 p-8 hover:border-blue-500/50 transition-all shadow-lg group relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-3xl text-blue-600 dark:text-blue-500">👤</div>
                                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">ID: {client.id}</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase truncate text-gray-800 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">{client.companyName}</h3>
                                <div className="space-y-2 mb-8 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                                    <div className="flex items-center gap-3"><FiUser className="text-blue-500" /> {client.contactName}</div>
                                    <div className="flex items-center gap-3"><FiMapPin className="text-blue-500" /> {client.address}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button onClick={() => openModal(client)} className="bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 p-3 rounded-xl transition-all flex justify-center text-gray-600 dark:text-white hover:text-white"><FiEdit2 size={16}/></button>
                                    <button className="bg-gray-100 dark:bg-gray-800 hover:bg-yellow-600 p-3 rounded-xl transition-all flex justify-center text-gray-600 dark:text-white hover:text-white"><FiFileText size={16}/></button>
                                    {currentUser.role === 'admin' && (
                                        <button onClick={() => handleDelete(client.id)} className="bg-gray-100 dark:bg-gray-800 hover:bg-red-600 p-3 rounded-xl transition-all flex justify-center text-gray-600 dark:text-white hover:text-white"><FiTrash2 size={16}/></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-10">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="bg-white dark:bg-[#1f2937] p-3 rounded-xl disabled:opacity-20 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-white"><FiChevronLeft /></button>
                            <span className="text-xs font-black uppercase text-gray-400 dark:text-gray-500">Página {currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="bg-white dark:bg-[#1f2937] p-3 rounded-xl disabled:opacity-20 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-white"><FiChevronRight /></button>
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles}>
                <div className="bg-white dark:bg-[#1f2937] p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl transition-colors max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <h2 className="text-2xl font-black uppercase italic text-blue-600 dark:text-blue-500">{selectedClient ? '✏️ Editar' : '🚀 Nuevo'} Cliente</h2>
                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"><FiX size={28} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="overflow-y-auto pr-2 custom-scrollbar space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-blue-600 dark:text-blue-500 text-[10px] font-black uppercase tracking-widest border-l-4 border-blue-500 pl-2">Empresa</h3>
                                <ModalInput label="Razón Social" value={newClient.fullName} onChange={(v) => setNewClient({...newClient, fullName: v})} required />
                                <ModalInput label="Nombre Comercial" value={newClient.companyName} onChange={(v) => setNewClient({...newClient, companyName: v})} required />
                                <ModalInput label="Giro" value={newClient.businessTurn} onChange={(v) => setNewClient({...newClient, businessTurn: v})} required />
                                <ModalInput label="Dirección" value={newClient.address} onChange={(v) => setNewClient({...newClient, address: v})} required />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-green-600 dark:text-green-500 text-[10px] font-black uppercase tracking-widest border-l-4 border-green-500 pl-2">Contacto</h3>
                                <ModalInput label="Nombre Contacto" value={newClient.contactName} onChange={(v) => setNewClient({...newClient, contactName: v})} />
                                <ModalInput label="Cargo" value={newClient.position} onChange={(v) => setNewClient({...newClient, position: v})} />
                                <ModalInput label="Email" type="email" value={newClient.email} onChange={(v) => setNewClient({...newClient, email: v})} />
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase ml-1">Vendedor</label>
                                        <select 
                                            disabled={currentUser.role !== 'admin'}
                                            value={newClient.assignedUser} 
                                            onChange={(e) => setNewClient({...newClient, assignedUser: e.target.value})}
                                            className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {activeUsers.map(u => <option key={u.id} value={u.email}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase ml-1">Planta</label>
                                        <select value={newClient.planta} onChange={(e) => setNewClient({...newClient, planta: e.target.value})} className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20">
                                            <option value="">Planta...</option>
                                            {unidadesNegocio.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 bg-gray-50 dark:bg-gray-800/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors">
                                <h3 className="text-yellow-600 dark:text-yellow-500 text-[10px] font-black uppercase tracking-widest border-l-4 border-yellow-500 pl-2">Facturación</h3>
                                <ModalInput label="Días Crédito" value={newClient.billingDepartment} onChange={(v) => setNewClient({...newClient, billingDepartment: v})} />
                                <ModalInput label="Uso CFDI" value={newClient.usoCFDI} onChange={(v) => setNewClient({...newClient, usoCFDI: v})} />
                                <ModalInput label="Método Pago" value={newClient.paymentMethod} onChange={(v) => setNewClient({...newClient, paymentMethod: v})} />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancelar</button>
                            <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-500 transition-all">
                                {selectedClient ? 'Guardar Cambios' : 'Registrar Cliente'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}

const ModalInput = ({ label, value, onChange, type = "text", required = false }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
        />
    </div>
);