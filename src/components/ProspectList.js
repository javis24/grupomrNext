import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleCreateProspect}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Crear Prospecto
        </button>
      </div>
      <div className="w-full max-w-4xl mt-6">
        {prospects.map((prospect) => (
          <div
            key={prospect.id}
            className="p-4 mb-2 bg-[#1f2937] rounded shadow-md flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-bold">{prospect.contactName}</h3>
              <p>Empresa: {prospect.company}</p>
              <p>Proceso de venta: {prospect.saleProcess}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(prospect)}
                className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
              >
                Editar
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white">Razón Social</label>
                <input
                  type="text"
                  value={newClient.fullName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, fullName: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Nombre de Empresa</label>
                <input
                  type="text"
                  value={newClient.companyName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, companyName: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Teléfono de Empresa</label>
                <input
                  type="text"
                  value={newClient.companyPhone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, companyPhone: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Giro de Negocios</label>
                <input
                  type="text"
                  value={newClient.businessTurn}
                  onChange={(e) =>
                    setNewClient({ ...newClient, businessTurn: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Dirección</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient({ ...newClient, address: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Nombre de Contacto</label>
                <input
                  type="text"
                  value={newClient.contactName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, contactName: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={newClient.contactPhone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, contactPhone: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Departamento</label>
                <input
                  type="text"
                  value={newClient.position}
                  onChange={(e) =>
                    setNewClient({ ...newClient, position: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Planta</label>
                <input
                  type="text"
                  value={newClient.planta}
                  onChange={(e) =>
                    setNewClient({ ...newClient, planta: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                />
              </div>
              <div>
                <label className="block text-white">Producto</label>
                <input
                  type="text"
                  value={newClient.producto}
                  onChange={(e) =>
                    setNewClient({ ...newClient, producto: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#1f2937] text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white">Usuario Asignado</label>
                <select
                  value={newClient.assignedUser}
                  onChange={(e) =>
                    setNewClient({ ...newClient, assignedUser: e.target.value })
                  }
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
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded mt-4"
            >
              Guardar
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
