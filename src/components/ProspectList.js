import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { toast } from "react-toastify";
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
  
      const tableColumn = ["NOMBRE", "EMPRESA", "TELÉFONO", "EMAIL", "VENTA"];
  
      const tableRows = prospects.map(p => [
        p.contactName || '',
        p.company || '',
        p.phone || '',
        p.email || '',
        p.saleProcess || ''
      ]);
  
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [255, 204, 0], textColor: 0 },
        styles: { fontSize: 10, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 50 },
          4: { cellWidth: 30 },
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
    const nameMatch = p.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const processMatch = p.saleProcess.toLowerCase().includes(searchProcess.toLowerCase());
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
    <div className="p-4 bg-[#0e1624] text-white min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Avances de Prospectos</h1>
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="p-2 rounded bg-[#1f2937] text-white w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por proceso de venta"
          className="p-2 rounded bg-[#1f2937] text-white w-full"
          value={searchProcess}
          onChange={(e) => setSearchProcess(e.target.value)}
        />
        <button
          onClick={() => exportAllProspectsToPDF(prospects)}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 w-full md:w-auto"
        >
          Exportar Todo a PDF
        </button>
        <button
          onClick={handleCreateProspect}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full md:w-auto"
        >
          Crear Prospecto
        </button>
      </div>


      <div className="w-full max-w-4xl mt-6">
  {filteredProspects.map((prospect) => (
    <div
      key={prospect.id}
      className="p-4 mb-2 bg-[#1f2937] rounded shadow-md flex justify-between items-center"
    >
      <div className="flex items-center space-x-4">
        <div className={`w-4 h-4 rounded-full ${getProspectStatusColor(prospect.createdAt)}`}></div>
        <div>
          <h3 className="text-xl font-bold">{prospect.contactName}</h3>
          <p>Empresa: {prospect.company}</p>
          <p>Proceso de venta: {prospect.saleProcess}</p>
          <p>Fecha de creación: {new Date(prospect.createdAt).toLocaleDateString('es-MX')}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleEdit(prospect)}
          className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
        >
          Editar
        </button>
        <button
          onClick={() => exportSingleProspectToPDF(prospect)}
          className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
        >
          Exportar PDF
        </button>
        {prospect.saleProcess === "Cerrado" && (
          <button
            onClick={() => handleConvertClick(prospect)}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Convertir a Cliente
          </button>
        )}
      </div>
    </div>
  ))}
</div>


  
       {/* Modal reutilizado para crear o editar prospecto */}
       {modalType && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          style={customStyles}
          contentLabel={
            modalType === "createProspect"
              ? "Crear Prospecto"
              : "Editar Prospecto"
          }
        >
          <h2 className="text-2xl font-bold mb-4">
            {modalType === "createProspect"
              ? "Crear Prospecto"
              : "Editar Prospecto"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-white">Proceso de Venta</label>
              <select
                name="saleProcess"
                value={formData.saleProcess}
                onChange={handleInputChange}
                className="w-full p-2 border rounded bg-[#374151] text-white"
                required
              >
                <option value="" disabled>
                  Selecciona un proceso
                </option>
                <option value="Contacto inicial">Contacto inicial</option>
                <option value="Seguimiento">Seguimiento</option>
                <option value="Propuesta enviada">Propuesta enviada</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-white">Nombre de Contacto</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded bg-[#374151] text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Empresa</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full p-2 border rounded bg-[#374151] text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded bg-[#374151] text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded bg-[#374151] text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              {modalType === "createProspect" ? "Crear" : "Actualizar"}
            </button>
            <button
              type="button"
              onClick={() => setModalIsOpen(false)}
              className="ml-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </form>
        </Modal>
      )}
  
     {/* Modal de convertir a cliente */}
      {modalType === "convertToClient" && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          style={customStyles}
          contentLabel="Convertir a Cliente"
        >
          <h2 className="text-2xl font-bold mb-4">Convertir a Cliente</h2>
          <form onSubmit={handleClientSave}>
      <div className="grid grid-cols-5 gap-4">
        <div>
          <label className="block text-white">Razón Social</label>
          <input
            type="text"
            value={newClient.fullName}
            onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">Nombre de Empresa</label>
          <input
            type="text"
            value={newClient.companyName}
            onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">Teléfono de Empresa</label>
          <input
            type="text"
            value={newClient.companyPhone}
            onChange={(e) => setNewClient({ ...newClient, companyPhone: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
          <label className="block text-white">Giro de Negocios</label>
          <input
            type="text"
            value={newClient.businessTurn}
            onChange={(e) => setNewClient({ ...newClient, businessTurn: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">Dirección</label>
          <input
            type="text"
            value={newClient.address}
            onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">Nombre de Contacto</label>
          <input
            type="text"
            value={newClient.contactName}
            onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
          <label className="block text-white">Teléfono de Contacto</label>
          <input
            type="text"
            value={newClient.contactPhone}
            onChange={(e) => setNewClient({ ...newClient, contactPhone: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
          <label className="block text-white">Email</label>
          <input
            type="email"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
          <label className="block text-white">Departamento</label>
          <input
            type="text"
            value={newClient.position}
            onChange={(e) => setNewClient({ ...newClient, position: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
          <label className="block text-white">Planta</label>
          <input
            type="text"
            value={newClient.planta}
            onChange={(e) => setNewClient({ ...newClient, planta: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
          <label className="block text-white">Producto</label>
          <input
            type="text"
            value={newClient.producto}
            onChange={(e) => setNewClient({ ...newClient, producto: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">Usuario Asignado</label>
          <select
            value={newClient.assignedUser}
            onChange={(e) => setNewClient({ ...newClient, assignedUser: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
            required
          >
            <option value="">Selecciona un usuario</option>
            {activeUsers.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-white">Nombre de contacto de facturación</label>
          <input
            type="text"
            value={newClient.billingContactName}
            onChange={(e) => setNewClient({ ...newClient, billingContactName: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
          <label className="block text-white">Teléfono de facturación</label>
          <input
            type="text"
            value={newClient.billingPhone}
            onChange={(e) => setNewClient({ ...newClient, billingPhone: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
          <label className="block text-white">Email de facturación</label>
          <input
            type="email"
            value={newClient.billingEmail}
            onChange={(e) => setNewClient({ ...newClient, billingEmail: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
          <label className="block text-white">Uso CFDI</label>
          <input
            type="text"
            value={newClient.usoCFDI}
            onChange={(e) => setNewClient({ ...newClient, usoCFDI: e.target.value })}
            className="w-full p-2 rounded bg-[#1f2937] text-white"
          />
        </div>
        <div>
              <label className="block text-white mb-2">Método de pago</label>
              <input
                type="text"
                value={newClient.paymentMethod}
                onChange={(e) => setNewClient({ ...newClient, paymentMethod: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Condiciones de pago</label>
              <input
                type="text"
                value={newClient.paymentConditions}
                onChange={(e) => setNewClient({ ...newClient, paymentConditions: e.target.value })}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
              />
            </div>
        </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
              Guardar
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
