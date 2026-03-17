import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import jsPDF from 'jspdf'; // Importamos jsPDF
import 'jspdf-autotable'; // Para la tabla

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#1f2937",
    border: "none",
    borderRadius: "8px",
    padding: "20px",
  },
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
};

export default function ProspectList() {
  const [prospects, setProspects] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'createProspect', 'editProspect', 'convertToClient'
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



  const exportAllProspectsToPDF = (prospects) => {
    if (!prospects || prospects.length === 0) {
      toast.warn("No hay prospectos para exportar.");
      return;
    }
  
    const doc = new jsPDF();
    const imgUrl = '/logo_mr.png';
    const image = new Image();
    image.src = imgUrl;
  
    image.onload = () => {
      doc.addImage(image, 'PNG', 20, 10, 40, 40);
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: 'center' });
      doc.text("MRE040121UBA", 105, 37, { align: 'center' });
  
      doc.setFontSize(14);
      doc.setFillColor(255, 204, 0);
      doc.rect(14, 50, 182, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("LISTA DE PROSPECTOS", 105, 57, null, 'center');
  
      const tableColumn = ["NOMBRE", "EMPRESA", "TELÉFONO", "EMAIL", "PROCESO DE VENTA", "STATUS CLIENTE"];
  
      const tableRows = prospects.map(p => [
        p.contactName || '',
        p.company || '',
        p.phone || '',
        p.email || '',
        p.saleProcess || '',
        new Date(p.createdAt).toLocaleDateString('es-MX', {
          year: 'numeric', month: '2-digit', day: '2-digit'
        })
      ]);
  
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [255, 204, 0], textColor: 0 },
        styles: { fontSize: 10, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 50 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          
        },
      });
  
      doc.save('prospectos.pdf');
    };
  };  
  
  const exportSingleProspectToPDF = (prospect) => {
    const doc = new jsPDF();
    const imgUrl = '/logo_mr.png';
    const image = new Image();
    image.src = imgUrl;
  
    image.onload = () => {
      doc.addImage(image, 'PNG', 20, 10, 20, 20);
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: 'center' });
      doc.text("MRE040121UBA", 105, 37, { align: 'center' });
  
      doc.setFontSize(14);
      doc.setFillColor(255, 204, 0);
      doc.rect(160, 20, 40, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("PROSPECTO", 180, 27, null, 'center');
  
      const details = [
        ["NOMBRE", prospect.contactName],
        ["EMPRESA", prospect.company],
        ["TELÉFONO", prospect.phone],
        ["EMAIL", prospect.email],
        ["PROCESO DE VENTA", prospect.saleProcess],
        ["STATUS CLIENTE", new Date(prospect.createdAt).toLocaleDateString('es-MX', {
          year: 'numeric', month: '2-digit', day: '2-digit'
        })],
      ];
  
      doc.autoTable({
        body: details,
        startY: 50,
        theme: 'plain',
        styles: {
          cellPadding: 1,
          fontSize: 10,
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { halign: 'left', textColor: [0, 0, 0], cellWidth: 60 },
          1: { halign: 'left', textColor: [0, 0, 0], cellWidth: 100 },
        },
      });
  
      doc.save(`${prospect.contactName}_prospecto.pdf`);
    };
  };

  const filteredProspects = prospects.filter((p) => {
    const nameMatch = searchTerm === "" || p.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
    const processMatch = searchProcess === "" || p.saleProcess?.toLowerCase().includes(searchProcess.toLowerCase());
    return nameMatch && processMatch;
  });
  



  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/prospects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProspects(response.data);
    } catch (err) {
      console.error("Error fetching prospects:", err);
      toast.error("No se pudieron cargar los prospectos.");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
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
      const token = localStorage.getItem("token");

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
      toast.success("Prospecto guardado exitosamente.");
    } catch (err) {
      console.error("Error saving prospect:", err);
      toast.error("Error al guardar el prospecto.");
    }
  };

  const handleEdit = (prospect) => {
    setEditingProspect(prospect);
    setFormData({
      saleProcess: prospect.saleProcess,
      contactName: prospect.contactName,
      company: prospect.company,
      phone: prospect.phone,
      email: prospect.email,
    });
    setModalType("editProspect");
    setModalIsOpen(true);
  };

  const handleCreateProspect = () => {
    setFormData({
      saleProcess: "",
      contactName: "",
      company: "",
      phone: "",
      email: "",
    });
    setModalType("createProspect");
    setModalIsOpen(true);
  };

  const getProspectStatusColor = (createdAt) => {
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays < 14) return 'bg-green-500';      // Menos de 2 semanas
    else if (diffDays >= 14 && diffDays <= 30) return 'bg-yellow-500';  // Entre 2 semanas y 1 mes
    else return 'bg-red-500';                      // Más de 1 mes
  };
  

  const handleConvertClick = (prospect) => {
    setNewClient({
      fullName: prospect.contactName || "",
      companyName: prospect.company || "",
      companyPhone: prospect.phone || "",
      businessTurn: "",
      address: "",
      contactName: prospect.contactName || "",
      contactPhone: prospect.phone || "",
      email: prospect.email || "",
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
    });
    setEditingProspect(prospect);
    setModalType("convertToClient");
    setModalIsOpen(true);
    fetchUsers();
  };

  const handleClientSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/clients", newClient, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await axios.delete(`/api/prospects/${editingProspect.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProspects((prev) =>
        prev.filter((prospect) => prospect.id !== editingProspect.id)
      );
      setModalIsOpen(false);
      setNewClient(initialClientState);
      toast.success("Cliente creado y prospecto eliminado.");
    } catch (err) {
      console.error("Error saving client:", err);
      toast.error("Error al guardar el cliente.");
    }
  };

  const resetForm = () => {
    setFormData({
      saleProcess: "",
      contactName: "",
      company: "",
      phone: "",
      email: "",
    });
    setEditingProspect(null);
  };

  return (
        <div className="p-2 md:p-6 bg-[#0e1624] text-white min-h-screen flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-black mb-6 uppercase tracking-tight">Avances de <span className="text-blue-500">Prospectos</span></h1>
            
            {/* BUSCADORES Y ACCIONES */}
            <div className="w-full max-w-5xl bg-[#1f2937] p-4 rounded-2xl border border-gray-700 shadow-2xl mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                        <input
                            type="text" placeholder="Buscar por nombre..."
                            className="w-full p-3 rounded-xl bg-[#0e1624] border border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-4">
                        <input
                            type="text" placeholder="Filtrar proceso..."
                            className="w-full p-3 rounded-xl bg-[#0e1624] border border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchProcess} onChange={(e) => setSearchProcess(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-4 flex gap-2">
                        <button onClick={handleCreateProspect} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-black text-[10px] uppercase">
                            + Crear
                        </button>
                    </div>
                </div>
            </div>

            {/* LISTADO DE TARJETAS (MOBILE FIRST) */}
            <div className="w-full max-w-5xl space-y-4">
                {filteredProspects.map((prospect) => (
                    <div key={prospect.id} className="relative bg-[#1f2937] p-5 rounded-2xl border border-gray-700 flex flex-col md:flex-row justify-between gap-4 transition-all hover:border-gray-500">
                        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getProspectStatusColor(prospect.createdAt)}`}></div>
                        <div className="flex flex-col">
                            <h3 className="text-lg font-black text-blue-400 uppercase tracking-tight">{prospect.contactName}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 text-xs text-gray-400 mt-2">
                                <p>🏢 {prospect.company}</p>
                                <p>⚙️ {prospect.saleProcess}</p>
                                <p className="text-[10px] font-mono mt-1">📅 {new Date(prospect.createdAt).toLocaleDateString('es-MX')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:flex items-center gap-2 border-t border-gray-700 md:border-none pt-3 md:pt-0">
                            <button onClick={() => handleEdit(prospect)} className="p-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg font-bold text-[10px] uppercase">Editar</button>
                            <button onClick={() => exportSingleProspectToPDF(prospect)} className="p-2 bg-gray-700 text-gray-300 rounded-lg font-bold text-[10px] uppercase">PDF</button>
                            {prospect.saleProcess === "Cerrado" && (
                                <button onClick={() => handleConvertClick(prospect)} className="col-span-2 md:col-auto p-2 bg-green-600 text-white rounded-lg font-black text-[10px] uppercase animate-pulse tracking-wider">Convertir</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL GLOBAL */}
            {modalType && (
                <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} style={customStyles}>
                    <h2 className="text-xl font-black mb-6 text-blue-400 uppercase border-b border-gray-700 pb-2">
                        {modalType === "convertToClient" ? "💎 Convertir a Cliente" : (modalType === "createProspect" ? "📝 Nuevo Prospecto" : "✏️ Editar Prospecto")}
                    </h2>
                    
                    <form onSubmit={modalType === "convertToClient" ? handleClientSave : handleSubmit} className="space-y-6">
                        {modalType === "convertToClient" ? (
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-[10px] font-black text-blue-500 mb-4 tracking-widest uppercase">1. Información de Empresa</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Razón Social</label>
                                            <input type="text" value={newClient.fullName} onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Giro</label>
                                            <input type="text" value={newClient.businessTurn} onChange={(e) => setNewClient({ ...newClient, businessTurn: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Producto</label>
                                            <input type="text" value={newClient.producto} onChange={(e) => setNewClient({ ...newClient, producto: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required />
                                        </div>
                                        <div className="flex flex-col gap-1 sm:col-span-2">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Dirección</label>
                                            <input type="text" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Asesor Asignado</label>
                                            <select value={newClient.assignedUser} onChange={(e) => setNewClient({ ...newClient, assignedUser: e.target.value })} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required>
                                                <option value="">Seleccionar...</option>
                                                {activeUsers.map(u => <option key={u.id} value={u.email}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </section>
                                <section className="bg-[#0e1624]/50 p-4 rounded-2xl border border-gray-800">
                                    <h3 className="text-[10px] font-black text-yellow-500 mb-4 tracking-widest uppercase">2. Datos de Facturación</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <input type="text" placeholder="Uso CFDI" value={newClient.usoCFDI} onChange={(e) => setNewClient({ ...newClient, usoCFDI: e.target.value })} className="bg-[#1f2937] p-3 rounded-xl border border-gray-700 text-sm text-white" />
                                        <input type="text" placeholder="Método Pago" value={newClient.paymentMethod} onChange={(e) => setNewClient({ ...newClient, paymentMethod: e.target.value })} className="bg-[#1f2937] p-3 rounded-xl border border-gray-700 text-sm text-white" />
                                        <input type="text" placeholder="Condiciones" value={newClient.paymentConditions} onChange={(e) => setNewClient({ ...newClient, paymentConditions: e.target.value })} className="bg-[#1f2937] p-3 rounded-xl border border-gray-700 text-sm text-white" />
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Proceso de Venta</label>
                                    <select name="saleProcess" value={formData.saleProcess} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required>
                                        <option value="" disabled>Seleccionar...</option>
                                        <option value="Contacto inicial">Contacto inicial</option>
                                        <option value="Seguimiento">Seguimiento</option>
                                        <option value="Propuesta enviada">Propuesta enviada</option>
                                        <option value="Cerrado">Cerrado</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Contacto</label>
                                    <input type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required />
                                </div>
                                <div className="flex flex-col gap-1 md:col-span-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Empresa</label>
                                    <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Teléfono</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500" required />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
                            <button type="submit" className="flex-1 bg-blue-600 p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-700">Confirmar y Guardar</button>
                            <button type="button" onClick={() => setModalIsOpen(false)} className="px-8 bg-gray-800 text-gray-400 p-4 rounded-xl font-black text-xs uppercase hover:bg-gray-700">Cancelar</button>
                        </div>
                    </form>
                </Modal>
            )}

            <ToastContainer theme="dark" position="bottom-center" />
        </div>
    );
}