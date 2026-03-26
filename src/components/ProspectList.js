import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Importamos un icono para el botón de PDF (asegúrate de tener react-icons instalado)
import { FiFileText, FiEdit, FiUserCheck } from "react-icons/fi";

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
        padding: "20px",
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

    // --- LÓGICA PARA EXPORTAR PDF ---
    const exportToPDF = (prospect) => {
        const doc = new jsPDF();

        // Configuración de encabezado
        doc.setFillColor(31, 41, 55);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("FICHA DE PROSPECTO", 105, 16, { align: 'center' });

        // Información General
        doc.setTextColor(40);
        doc.setFontSize(12);
        doc.text(`Fecha de creación: ${new Date(prospect.createdAt).toLocaleDateString()}`, 14, 35);
        doc.text(`Estado actual: ${prospect.saleProcess}`, 14, 42);

        // Tabla de datos
        const tableBody = [
            ["Nombre del Contacto", prospect.contactName],
            ["Empresa / Negocio", prospect.company],
            ["Teléfono", prospect.phone],
            ["Correo Electrónico", prospect.email],
            ["Proceso de Venta", prospect.saleProcess]
        ];

        doc.autoTable({
            startY: 50,
            head: [['Campo', 'Valor']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 11, cellPadding: 5 }
        });

        // Pie de página
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Documento generado automáticamente por Sistema CRM Grupo MR", 14, finalY);

        doc.save(`Prospecto_${prospect.contactName.replace(/\s+/g, '_')}.pdf`);
        toast.info("PDF generado correctamente");
    };

    // --- LÓGICA PARA RECIBIR DATOS DEL CALENDARIO ---
    useEffect(() => {
        if (router.isReady) {
            const { name, phone } = router.query;
            if (name) {
                setFormData({
                    saleProcess: "Contacto inicial",
                    contactName: name,
                    company: name, 
                    phone: phone || "",
                    email: ""
                });
                setModalType("createProspect");
                setModalIsOpen(true);
            }
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
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
            const response = await axios.get("/api/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setActiveUsers(response.data);
        } catch (err) {
            toast.error("No se pudieron cargar los usuarios.");
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
            if (modalType === "editProspect") {
                await axios.put(`/api/prospects/${editingProspect.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else if (modalType === "createProspect") {
                const response = await axios.post("/api/prospects", formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProspects([response.data, ...prospects]);
            }
            setModalIsOpen(false);
            resetForm();
            fetchProspects();
            toast.success("Prospecto guardado correctamente.");
        } catch (err) {
            toast.error("Error al guardar el prospecto.");
        }
    };

    const handleEdit = (prospect) => {
        setEditingProspect(prospect);
        setFormData({ ...prospect });
        setModalType("editProspect");
        setModalIsOpen(true);
    };

    const handleCreateProspect = () => {
        resetForm();
        setModalType("createProspect");
        setModalIsOpen(true);
    };

    const handleConvertClick = (prospect) => {
        setNewClient({
            ...initialClientState,
            fullName: prospect.contactName || "",
            companyName: prospect.company || "",
            companyPhone: prospect.phone || "",
            contactName: prospect.contactName || "",
            contactPhone: prospect.phone || "",
            email: prospect.email || "",
        });
        setEditingProspect(prospect);
        setModalType("convertToClient");
        setModalIsOpen(true);
    };

    const handleClientSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post("/api/clients", newClient, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await axios.delete(`/api/prospects/${editingProspect.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProspects((prev) => prev.filter((p) => p.id !== editingProspect.id));
            setModalIsOpen(false);
            toast.success("¡Cliente creado exitosamente!");
        } catch (err) {
            toast.error("Error al convertir prospecto.");
        }
    };

    const resetForm = () => {
        setFormData({ saleProcess: "", contactName: "", company: "", phone: "", email: "" });
        setEditingProspect(null);
    };

    const getProspectStatusColor = (createdAt) => {
        const diffDays = Math.ceil(Math.abs(new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
        if (diffDays < 14) return 'bg-green-500';
        if (diffDays <= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const filteredProspects = prospects.filter((p) => {
        const nameMatch = p.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
        const processMatch = p.saleProcess?.toLowerCase().includes(searchProcess.toLowerCase());
        return nameMatch && processMatch;
    });

    return (
        <div className="p-2 md:p-6 bg-[#0e1624] text-white min-h-screen flex flex-col items-center font-sans">
            <h1 className="text-2xl md:text-3xl font-black mb-6 uppercase tracking-tight text-center">
                Avances de <span className="text-blue-500">Prospectos</span>
            </h1>
            
            {/* BUSCADORES Y ACCIONES */}
            <div className="w-full max-w-5xl bg-[#1f2937] p-4 rounded-2xl border border-gray-700 shadow-2xl mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                        <input
                            type="text" placeholder="Buscar por nombre..."
                            className="w-full p-3 rounded-xl bg-[#0e1624] border border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-4">
                        <input
                            type="text" placeholder="Filtrar proceso..."
                            className="w-full p-3 rounded-xl bg-[#0e1624] border border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={searchProcess} onChange={(e) => setSearchProcess(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-4 flex gap-2">
                        <button onClick={handleCreateProspect} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-black text-[10px] uppercase transition-all shadow-lg">
                            + Crear Nuevo
                        </button>
                    </div>
                </div>
            </div>

            {/* LISTADO DE TARJETAS */}
            <div className="w-full max-w-5xl space-y-4">
                {filteredProspects.map((prospect) => (
                    <div key={prospect.id} className="relative bg-[#1f2937] p-5 rounded-2xl border border-gray-700 flex flex-col md:flex-row justify-between gap-4 transition-all hover:border-gray-500 shadow-lg group">
                        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getProspectStatusColor(prospect.createdAt)}`}></div>
                        <div className="flex flex-col">
                            <h3 className="text-lg font-black text-blue-400 uppercase tracking-tight">{prospect.contactName}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 text-xs text-gray-400 mt-2">
                                <p>🏢 <span className="text-gray-200">{prospect.company}</span></p>
                                <p>⚙️ <span className="text-gray-200">{prospect.saleProcess}</span></p>
                                <p className="text-[10px] font-mono mt-1 opacity-60">📅 {new Date(prospect.createdAt).toLocaleDateString('es-MX')}</p>
                            </div>
                        </div>
                        
                        {/* BOTONES DE ACCIÓN MEJORADOS */}
                        <div className="grid grid-cols-2 sm:flex items-center gap-2 pt-3 md:pt-0 border-t border-gray-700 md:border-none">
                            <button 
                                onClick={() => exportToPDF(prospect)} 
                                className="flex items-center justify-center gap-2 p-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-lg font-bold text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Exportar a PDF"
                            >
                                <FiFileText size={14} /> PDF
                            </button>
                            <button 
                                onClick={() => handleEdit(prospect)} 
                                className="flex items-center justify-center gap-2 p-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg font-bold text-[10px] uppercase hover:bg-yellow-500 hover:text-black transition-all shadow-sm"
                            >
                                <FiEdit size={14} /> Editar
                            </button>
                            {prospect.saleProcess === "Cerrado" && (
                                <button 
                                    onClick={() => handleConvertClick(prospect)} 
                                    className="col-span-2 md:col-auto flex items-center justify-center gap-2 p-2 bg-green-600 text-white rounded-lg font-black text-[10px] uppercase animate-pulse tracking-wider shadow-lg"
                                >
                                    <FiUserCheck size={14} /> Convertir a Cliente
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {filteredProspects.length === 0 && (
                    <div className="text-center py-20 bg-[#1f2937] rounded-2xl border border-dashed border-gray-700 opacity-50 uppercase font-black tracking-widest text-xs">
                        No se encontraron prospectos
                    </div>
                )}
            </div>

            {/* MODAL GLOBAL */}
            {modalType && (
                <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} style={customStyles}>
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                        <h2 className="text-xl font-black text-blue-400 uppercase flex items-center gap-2">
                            {modalType === "convertToClient" ? "💎 Alta de Nuevo Cliente" : (modalType === "createProspect" ? "📝 Registro de Prospecto" : "✏️ Editar Información")}
                        </h2>
                        <button onClick={() => setModalIsOpen(false)} className="text-gray-500 hover:text-white text-2xl">&times;</button>
                    </div>
                    
                    <form onSubmit={modalType === "convertToClient" ? handleClientSave : handleSubmit} className="space-y-6">
                        {modalType === "convertToClient" ? (
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-[10px] font-black text-blue-500 mb-4 tracking-widest uppercase border-l-4 border-blue-500 pl-2">1. Información de Empresa</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Razón Social</label>
                                            <input type="text" value={newClient.fullName} onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Giro</label>
                                            <input type="text" value={newClient.businessTurn} onChange={(e) => setNewClient({ ...newClient, businessTurn: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Producto</label>
                                            <input type="text" value={newClient.producto} onChange={(e) => setNewClient({ ...newClient, producto: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
                                        </div>
                                        <div className="flex flex-col gap-1 sm:col-span-2">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Dirección</label>
                                            <input type="text" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Asesor Asignado</label>
                                            <select value={newClient.assignedUser} onChange={(e) => setNewClient({ ...newClient, assignedUser: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required>
                                                <option value="">Seleccionar...</option>
                                                {activeUsers.map(u => <option key={u.id} value={u.email}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </section>
                                <section className="bg-[#0e1624]/50 p-4 rounded-2xl border border-gray-800">
                                    <h3 className="text-[10px] font-black text-yellow-500 mb-4 tracking-widest uppercase border-l-4 border-yellow-500 pl-2">2. Datos Fiscales y Pago</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <input type="text" placeholder="Uso CFDI" value={newClient.usoCFDI} onChange={(e) => setNewClient({ ...newClient, usoCFDI: e.target.value })} className="bg-[#1f2937] p-3 rounded-xl border border-gray-700 text-sm text-white focus:border-yellow-500 outline-none transition-all" />
                                        <input type="text" placeholder="Método Pago" value={newClient.paymentMethod} onChange={(e) => setNewClient({ ...newClient, paymentMethod: e.target.value })} className="bg-[#1f2937] p-3 rounded-xl border border-gray-700 text-sm text-white focus:border-yellow-500 outline-none transition-all" />
                                        <input type="text" placeholder="Condiciones" value={newClient.paymentConditions} onChange={(e) => setNewClient({ ...newClient, paymentConditions: e.target.value })} className="bg-[#1f2937] p-3 rounded-xl border border-gray-700 text-sm text-white focus:border-yellow-500 outline-none transition-all" />
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Etapa de Venta</label>
                                    <select name="saleProcess" value={formData.saleProcess} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required>
                                        <option value="" disabled>Seleccionar...</option>
                                        <option value="Contacto inicial">Contacto inicial</option>
                                        <option value="Seguimiento">Seguimiento</option>
                                        <option value="Propuesta enviada">Propuesta enviada</option>
                                        <option value="Cerrado">Cerrado</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Nombre Contacto</label>
                                    <input type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
                                </div>
                                <div className="flex flex-col gap-1 md:col-span-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Empresa / Negocio</label>
                                    <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Teléfono</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
                            <button type="submit" className="flex-1 bg-blue-600 p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-700 shadow-lg shadow-blue-900/40">
                                Confirmar y Guardar
                            </button>
                            <button type="button" onClick={() => setModalIsOpen(false)} className="px-8 bg-gray-800 text-gray-400 p-4 rounded-xl font-black text-xs uppercase hover:bg-gray-700 transition-all">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            <ToastContainer theme="dark" position="bottom-center" limit={1} />
        </div>
    );
}