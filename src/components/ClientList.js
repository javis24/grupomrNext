import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import jwt from 'jsonwebtoken';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
    FiSearch, FiPlus, FiDownload, FiEdit2, FiTrash2, 
    FiFileText, FiChevronLeft, FiChevronRight, FiUser, FiMapPin, FiBriefcase 
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '1.5rem',
        padding: '20px',
        width: '95%',
        maxWidth: '1100px',
        maxHeight: '90vh',
    },
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 1000 }
};

export default function ClientList() {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState('');
    const [filterField, setFilterField] = useState('companyName');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [activeUsers, setActiveUsers] = useState([]);
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    const initialClientState = {
        fullName: '', companyName: '', companyPhone: '', businessTurn: '',
        address: '', contactName: '', contactPhone: '', email: '',
        position: '', planta: '', producto: '', assignedUser: '',
        billingContactName: '', billingPhone: '', billingEmail: '',
        usoCFDI: '', paymentMethod: '', paymentConditions: '', billingDepartment: '',
    };

    const [newClient, setNewClient] = useState(initialClientState);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwt.decode(token);
            setUserEmail(decoded.email);
        }
        fetchUsers();
    }, []);

    useEffect(() => {
        if (userEmail) fetchClients();
    }, [userEmail]);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/clients', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            let data = response.data;
            if (userEmail === 'tarimas@grupomrlaguna.com') {
                data = data.filter(c => c.planta?.toLowerCase() === 'tarimas');
            }
            setClients(data);
        } catch (error) { toast.error('Error al cargar clientes'); }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
            setActiveUsers(res.data);
        } catch (e) { console.error("Error users"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const decoded = jwt.decode(token);
        const userId = decoded.id;

        try {
            const clientData = { ...newClient, userId };
            if (selectedClient) {
                await axios.put(`/api/clients/${selectedClient.id}`, clientData, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                toast.success("Cliente actualizado");
            } else {
                await axios.post('/api/clients', clientData, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                toast.success("Cliente creado");
            }
            fetchClients();
            closeModal();
        } catch (error) { toast.error("Error al guardar"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar cliente?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/clients/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchClients();
            toast.success("Eliminado");
        } catch (e) { toast.error("Error al eliminar"); }
    };

    const openModal = (client = null) => {
        setSelectedClient(client);
        setNewClient(client || initialClientState);
        setModalIsOpen(true);
    };

    const closeModal = () => { setModalIsOpen(false); setSelectedClient(null); };

    // Lógica de Filtrado y Paginación
    const filteredClients = clients.filter((c) => {
        const val = c[filterField] ? c[filterField].toString().toLowerCase() : '';
        return val.includes(search.toLowerCase());
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    const exportClientToPDF = (client) => {
        const doc = new jsPDF();
        doc.setFillColor(255, 204, 0);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFontSize(14);
        doc.text("EXPEDIENTE DE CLIENTE - GRUPO MR", 105, 13, { align: 'center' });
        
        const body = Object.entries(client)
            .filter(([key]) => key !== 'id' && key !== 'userId')
            .map(([key, val]) => [key.toUpperCase(), val || 'N/A']);

        doc.autoTable({
            startY: 25,
            head: [['CAMPO', 'VALOR']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [31, 41, 55] }
        });
        doc.save(`Cliente_${client.companyName}.pdf`);
    };

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <ToastContainer theme="dark" />
            
            {/* HEADER */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-blue-500">Clientes</h1>
                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Gestión de cartera Grupo MR</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => openModal()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20">
                        <FiPlus /> Añadir
                    </button>
                </div>
            </div>

            {/* FILTROS */}
            <div className="max-w-7xl mx-auto bg-[#1f2937] p-4 rounded-3xl border border-gray-700 mb-8 flex flex-col md:flex-row gap-4 shadow-xl">
                <div className="flex items-center bg-[#0e1624] rounded-2xl px-4 py-2 flex-1 border border-gray-800 focus-within:border-blue-500 transition-all">
                    <FiSearch className="text-gray-500 mr-3" />
                    <input 
                        type="text" 
                        placeholder={`Buscar por ${filterField}...`}
                        className="bg-transparent w-full outline-none text-sm p-1"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <select 
                    value={filterField} 
                    onChange={(e) => setFilterField(e.target.value)}
                    className="bg-[#0e1624] border border-gray-800 rounded-2xl px-4 py-2 text-sm outline-none focus:border-blue-500 text-white"
                >
                    <option value="companyName">Empresa</option>
                    <option value="fullName">Razón Social</option>
                    <option value="contactName">Contacto</option>
                    <option value="planta">Planta</option>
                </select>
            </div>

            {/* GRID DE CARDS */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentClients.map((client) => (
                    <div key={client.id} className="bg-[#1f2937] rounded-3xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all group shadow-lg flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 text-2xl group-hover:scale-110 transition-transform">
                                    🏢
                                </div>
                                <span className="text-[10px] font-black bg-gray-800 text-blue-400 px-3 py-1 rounded-full uppercase border border-gray-700">
                                    {client.planta || 'Gral'}
                                </span>
                            </div>
                            <h3 className="text-lg font-black uppercase truncate text-white">{client.companyName}</h3>
                            <p className="text-gray-500 text-[10px] font-bold mb-4 truncate uppercase tracking-widest">{client.fullName}</p>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <FiUser className="text-blue-500" /> <span className="truncate">{client.contactName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <FiMapPin className="text-blue-500" /> <span className="truncate">{client.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <FiBriefcase className="text-blue-500" /> <span className="truncate">{client.businessTurn}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-800">
                            <button onClick={() => openModal(client)} className="bg-gray-800 hover:bg-green-600 p-3 rounded-xl transition-all flex justify-center text-white" title="Editar">
                                <FiEdit2 />
                            </button>
                            <button onClick={() => exportClientToPDF(client)} className="bg-gray-800 hover:bg-yellow-600 p-3 rounded-xl transition-all flex justify-center text-white" title="PDF">
                                <FiFileText />
                            </button>
                            <button onClick={() => handleDelete(client.id)} className="bg-gray-800 hover:bg-red-600 p-3 rounded-xl transition-all flex justify-center text-white" title="Eliminar">
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
                <div className="max-w-7xl mx-auto mt-12 flex justify-center items-center gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-lg bg-gray-800 disabled:opacity-30"><FiChevronLeft/></button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-blue-600' : 'bg-gray-800'}`}>
                            {i + 1}
                        </button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-lg bg-gray-800 disabled:opacity-30"><FiChevronRight/></button>
                </div>
            )}

            {/* MODAL COMPLETO */}
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase italic text-white">{selectedClient ? '✏️ Editar Cliente' : '🚀 Nuevo Cliente'}</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors text-2xl">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ModalInput label="Razón Social" value={newClient.fullName} onChange={(v) => setNewClient({...newClient, fullName: v})} required />
                        <ModalInput label="Nombre Comercial" value={newClient.companyName} onChange={(v) => setNewClient({...newClient, companyName: v})} required />
                        <ModalInput label="Tel. Empresa" value={newClient.companyPhone} onChange={(v) => setNewClient({...newClient, companyPhone: v})} />
                        <ModalInput label="Giro" value={newClient.businessTurn} onChange={(v) => setNewClient({...newClient, businessTurn: v})} />
                        <ModalInput label="Dirección" value={newClient.address} onChange={(v) => setNewClient({...newClient, address: v})} />
                        <ModalInput label="Contacto" value={newClient.contactName} onChange={(v) => setNewClient({...newClient, contactName: v})} />
                        <ModalInput label="Tel. Contacto" value={newClient.contactPhone} onChange={(v) => setNewClient({...newClient, contactPhone: v})} />
                        <ModalInput label="Email" type="email" value={newClient.email} onChange={(v) => setNewClient({...newClient, email: v})} />
                        <ModalInput label="Departamento" value={newClient.position} onChange={(v) => setNewClient({...newClient, position: v})} />
                        <ModalInput label="Planta" value={newClient.planta} onChange={(v) => setNewClient({...newClient, planta: v})} />
                        <ModalInput label="Producto" value={newClient.producto} onChange={(v) => setNewClient({...newClient, producto: v})} />
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Vendedor Asignado</label>
                            <select 
                                value={newClient.assignedUser} 
                                onChange={(e) => setNewClient({...newClient, assignedUser: e.target.value})}
                                className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500"
                            >
                                <option value="">Seleccionar...</option>
                                {activeUsers.map(u => <option key={u.id} value={u.email}>{u.name}</option>)}
                            </select>
                        </div>

                        {/* Campos de Facturación */}
                        <ModalInput label="Contacto Pago" value={newClient.billingContactName} onChange={(v) => setNewClient({...newClient, billingContactName: v})} />
                        <ModalInput label="Uso CFDI" value={newClient.usoCFDI} onChange={(v) => setNewClient({...newClient, usoCFDI: v})} />
                        <ModalInput label="Método de Pago" value={newClient.paymentMethod} onChange={(v) => setNewClient({...newClient, paymentMethod: v})} />
                    </div>

                    <button type="submit" className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]">
                        {selectedClient ? 'Actualizar Registro' : 'Crear Cliente'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}

// Componente Interno para Inputs del Modal
const ModalInput = ({ label, value, onChange, type = "text", required = false }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">{label}</label>
        <input 
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="bg-[#0e1624] border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all text-white hover:bg-[#162030]"
        />
    </div>
);