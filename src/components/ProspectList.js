import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FiFileText, FiEdit, FiUserCheck, FiX, FiPlus } from "react-icons/fi";
import jwt from 'jsonwebtoken';

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#1f2937",
        border: "1px solid #374151",
        borderRadius: "24px",
        padding: "24px",
        width: "95%",
        maxWidth: "1000px",
        maxHeight: "90vh",
        overflowY: "auto",
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        zIndex: 1000
    }
};

const unidadesNegocio = ['Servicios', 'Empaques', 'Tarimas', 'Alimentos', 'Plasticos', 'Composta'];

const initialClientState = {
    fullName: "",
    companyName: "",
    companyPhone: "",
    businessTurn: "",
    address: "",
    contactName: "",
    contactPhone: "",
    email: "",
    position: "",
    planta: "",
    producto: "",
    assignedUser: "",
    billingContactName: "",
    billingPhone: "",
    billingEmail: "",
    usoCFDI: "",
    paymentMethod: "",
    paymentConditions: "",
};

export default function ProspectList() {
    const router = useRouter();
    const [userRole, setUserRole] = useState("");
    const [loggedUserId, setLoggedUserId] = useState(null);
    const [loggedUserEmail, setLoggedUserEmail] = useState("");
    const [loggedUserName, setLoggedUserName] = useState("");
    const [prospects, setProspects] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [formData, setFormData] = useState({
        saleProcess: "",
        contactName: "",
        company: "",
        phone: "",
        email: "",
    });
    const [editingProspect, setEditingProspect] = useState(null);
    const [newClient, setNewClient] = useState(initialClientState);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchProcess, setSearchProcess] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwt.decode(token);
                setUserRole(decoded.role);
                setLoggedUserId(decoded.id);
                setLoggedUserEmail(decoded.email);
                setLoggedUserName(decoded.name);
            } catch (e) { console.error("Error JWT", e); }
        }
        fetchProspects();
        fetchUsers();
    }, []);

    const fetchProspects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get("/api/prospects", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProspects(response.data);
        } catch (err) {
            toast.error("No se pudieron cargar los prospectos.");
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const decoded = jwt.decode(token);
            if (decoded.role !== 'admin' && decoded.role !== 'gerencia') {
                setActiveUsers([{ id: decoded.id, name: decoded.name, email: decoded.email }]);
                return;
            }
            const response = await axios.get("/api/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setActiveUsers(response.data);
        } catch (err) {
            if (err.response?.status !== 403) console.error("Error usuarios", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const dataToSave = { ...formData, userId: loggedUserId };

            if (modalType === "editProspect") {
                await axios.put(`/api/prospects/${editingProspect.id}`, dataToSave, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Prospecto actualizado");
            } else {
                await axios.post("/api/prospects", dataToSave, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Prospecto creado");
            }
            setModalIsOpen(false);
            fetchProspects();
            resetForm();
        } catch (err) {
            toast.error("Error al procesar");
        }
    };

    const handleConvertClick = (prospect) => {
        setNewClient({
            ...initialClientState,
            fullName: prospect.company || "",
            companyName: prospect.company || "",
            contactName: prospect.contactName || "",
            contactPhone: prospect.phone || "",
            companyPhone: prospect.phone || "",
            email: prospect.email || "",
            assignedUser: userRole === 'admin' ? "" : loggedUserEmail 
        });
        setEditingProspect(prospect);
        setModalType("convertToClient");
        setModalIsOpen(true);
    };

    const handleClientSave = async (e) => {
        e.preventDefault();
        if (!newClient.planta) return toast.warning("Debes seleccionar una planta/unidad");
        
        try {
            const token = localStorage.getItem('token');
            // 1. Crear el cliente
            await axios.post("/api/clients", newClient, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // 2. Eliminar el prospecto (ya es cliente)
            await axios.delete(`/api/prospects/${editingProspect.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProspects((prev) => prev.filter((p) => p.id !== editingProspect.id));
            setModalIsOpen(false);
            toast.success("🚀 ¡Convertido a Cliente exitosamente!");
        } catch (err) {
            toast.error("Error en la conversión");
        }
    };

    const handleDelete = async (id) => {
        if (userRole !== 'admin') return toast.error("Acceso denegado");
        if (!confirm("¿Eliminar este prospecto?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/prospects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProspects(prev => prev.filter(p => p.id !== id));
            toast.success("Eliminado");
        } catch (err) { toast.error("Error"); }
    };

    const resetForm = () => {
        setFormData({ saleProcess: "", contactName: "", company: "", phone: "", email: "" });
        setEditingProspect(null);
    };

    const exportToPDF = (prospect) => {
        const doc = new jsPDF();
        doc.setFillColor(31, 41, 55);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("FICHA DE PROSPECTO", 105, 16, { align: 'center' });
        doc.autoTable({
            startY: 35,
            head: [['Campo', 'Información']],
            body: [
                ["Contacto", prospect.contactName],
                ["Empresa", prospect.company],
                ["Teléfono", prospect.phone],
                ["Email", prospect.email],
                ["Estatus", prospect.saleProcess],
                ["Fecha", new Date(prospect.createdAt).toLocaleDateString()]
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });
        doc.save(`Prospecto_${prospect.contactName}.pdf`);
    };

    const filteredProspects = prospects.filter((p) => 
        p.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        p.saleProcess?.toLowerCase().includes(searchProcess.toLowerCase())
    );

   return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-[#0e1624] text-gray-900 dark:text-white min-h-screen font-sans transition-colors duration-300">
            <ToastContainer theme="colored" position="bottom-right" />
            
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-800 dark:text-white">
                        Avances de <span className="text-blue-600 dark:text-blue-500">Prospectos</span>
                    </h1>
                    <button 
                        onClick={() => { setModalType("createProspect"); setModalIsOpen(true); resetForm(); }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                    >
                        <FiPlus /> Nuevo Prospecto
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-[#1f2937] p-4 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 transition-colors">
                    <input type="text" placeholder="Buscar por nombre..." className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <input type="text" placeholder="Filtrar por etapa..." className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all" value={searchProcess} onChange={(e) => setSearchProcess(e.target.value)} />
                </div>

                {/* Listado */}
                <div className="space-y-4">
                    {filteredProspects.map((prospect) => (
                        <div key={prospect.id} className="bg-white dark:bg-[#1f2937] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/50 transition-all group shadow-sm">
                            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{prospect.contactName}</h3>
                                <p className="text-blue-600 dark:text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{prospect.company}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] text-gray-500 font-bold uppercase">
                                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">⚙️ {prospect.saleProcess}</span>
                                    <span>📞 {prospect.phone}</span>
                                    <span>📅 {new Date(prospect.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button onClick={() => exportToPDF(prospect)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><FiFileText size={18}/></button>
                                <button onClick={() => { setEditingProspect(prospect); setFormData({...prospect}); setModalType("editProspect"); setModalIsOpen(true); }} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all shadow-sm"><FiEdit size={18}/></button>
                                {userRole === 'admin' && <button onClick={() => handleDelete(prospect.id)} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"><FiX size={18}/></button>}
                                {prospect.saleProcess === "Cerrado" && (
                                    <button onClick={() => handleConvertClick(prospect)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg animate-pulse">
                                        <FiUserCheck size={14}/> Convertir
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL UNIFICADO */}
            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} style={customStyles}>
                {/* Contenedor interno del modal para controlar el tema */}
                <div className="bg-white dark:bg-[#1f2937] p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <h2 className="text-2xl font-black text-blue-600 dark:text-blue-500 uppercase italic">
                            {modalType === "convertToClient" ? "💎 Alta de Cliente" : (modalType === "createProspect" ? "📝 Nuevo Prospecto" : "✏️ Editar")}
                        </h2>
                        <button onClick={() => setModalIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"><FiX size={32}/></button>
                    </div>

                    <form onSubmit={modalType === "convertToClient" ? handleClientSave : handleSubmit} className="space-y-6 text-gray-900 dark:text-white">
                        {modalType === "convertToClient" ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-l-4 border-blue-500 pl-2">Empresa</p>
                                    <ModalInput label="Razón Social" value={newClient.fullName} onChange={(v) => setNewClient({...newClient, fullName: v})} required />
                                    <ModalInput label="Giro" value={newClient.businessTurn} onChange={(v) => setNewClient({...newClient, businessTurn: v})} required />
                                    <ModalInput label="Dirección" value={newClient.address} onChange={(v) => setNewClient({...newClient, address: v})} required />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest border-l-4 border-green-500 pl-2">Contacto</p>
                                    <ModalInput label="Cargo" value={newClient.position} onChange={(v) => setNewClient({...newClient, position: v})} />
                                    <ModalInput label="Teléfono Empresa" value={newClient.companyPhone} onChange={(v) => setNewClient({...newClient, companyPhone: v})} />
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase ml-1">Planta / Unidad</label>
                                        <select value={newClient.planta} onChange={(e) => setNewClient({...newClient, planta: e.target.value})} className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20" required>
                                            <option value="">Seleccionar Unidad...</option>
                                            {unidadesNegocio.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase ml-1">Asesor Responsable</label>
                                        <select disabled={userRole !== 'admin'} value={newClient.assignedUser} onChange={(e) => setNewClient({...newClient, assignedUser: e.target.value})} className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20" required>
                                            {activeUsers.map(u => <option key={u.id} value={u.email}>{u.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">Facturación</p>
                                    <ModalInput label="Uso CFDI" value={newClient.usoCFDI} onChange={(v) => setNewClient({...newClient, usoCFDI: v})} />
                                    <ModalInput label="Método Pago" value={newClient.paymentMethod} onChange={(v) => setNewClient({...newClient, paymentMethod: v})} />
                                    <ModalInput label="Días Crédito" value={newClient.paymentConditions} onChange={(v) => setNewClient({...newClient, paymentConditions: v})} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase ml-1">Etapa actual</label>
                                    <select name="saleProcess" value={formData.saleProcess} onChange={handleInputChange} className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 p-4 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20" required>
                                        <option value="">Seleccionar Etapa...</option>
                                        <option value="Contacto inicial">Contacto inicial</option>
                                        <option value="Seguimiento">Seguimiento</option>
                                        <option value="Propuesta enviada">Propuesta enviada</option>
                                        <option value="Cerrado">Cerrado (Ganado)</option>
                                    </select>
                                </div>
                                <ModalInput label="Nombre de Contacto" name="contactName" value={formData.contactName} onChange={(v) => setFormData({...formData, contactName: v})} required />
                                <ModalInput label="Empresa" name="company" value={formData.company} onChange={(v) => setFormData({...formData, company: v})} required />
                                <ModalInput label="Teléfono" name="phone" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} required />
                                <ModalInput label="Email" name="email" type="email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} required />
                            </div>
                        )}

                        <div className="flex gap-4 pt-8 border-t border-gray-100 dark:border-gray-700">
                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95">
                                {modalType === "convertToClient" ? "🚀 Finalizar Registro" : "💾 Guardar Cambios"}
                            </button>
                            <button type="button" onClick={() => setModalIsOpen(false)} className="px-8 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-4 rounded-2xl font-black uppercase text-xs transition-all">Cancelar</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}

const ModalInput = ({ label, value, onChange, type = "text", required = false }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase ml-1">{label} {required && "*"}</label>
        <input 
            type={type} 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            required={required}
            className="bg-gray-50 dark:bg-[#0e1624] border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all" 
        />
    </div>
);