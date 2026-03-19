import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientPrices() {
  const [clientsData, setClientsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- ESTADOS PARA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Número de registros por página

  useEffect(() => {
    fetchPrices();
    fetchUsers();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await axios.get("/api/client-prices");
      setClientsData(response.data);
    } catch (error) {
      console.error("Error al obtener datos");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveUsers(response.data);
    } catch (error) { console.error("Error usuarios"); }
  };

  // --- MANEJO DE EXCEL (Basado en tu imagen) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Mapeo según el orden de tu imagen:
        // [0]Nombre, [1]Empresa/Contacto, [2]Puesto, [3]Tel1, [4]Tel2, [5]Email, [6]Planta...
        const formattedData = jsonData.slice(1)
          .filter(row => row[0]) // Filtra filas sin nombre
          .map((row) => ({
            cliente: row[0] || "S/N",
            contacto: row[1] || "",
            puesto: row[2] || "",
            telefono: row[3] || row[4] || "",
            email: row[5] || "",
            ubicacion: row[6] || "",
            asesorcomercial: "", 
            rfc: "" 
          }));

        const response = await axios.post("/api/client-prices", {
          clients: formattedData,
        });

        if (response.status === 201) {
          toast.success(`${formattedData.length} clientes guardados automáticamente`);
          fetchPrices();
        }
      } catch (error) {
        toast.error("Error al procesar el archivo");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSelectAsesor = async (uuid, newAsesor) => {
    try {
      await axios.put("/api/client-prices", { uuid, asesorcomercial: newAsesor });
      setClientsData(prev => prev.map(c => c.uuid === uuid ? { ...c, asesorcomercial: newAsesor } : c));
      toast.success("Asesor asignado");
    } catch (err) { toast.error("Error al asignar"); }
  };

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
  const filteredData = clientsData.filter((item) =>
    item.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-4 md:p-8 bg-[#0e1624] text-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-blue-500">
            📊 Cartera de Clientes
          </h1>
          
          <div className="flex items-center gap-3">
            <label className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-black text-xs cursor-pointer transition-all shadow-lg shadow-blue-900/20">
              {loading ? "CARGANDO..." : "SUBIR EXCEL"}
              <input type="file" accept=".xlsx,.xls" hidden onChange={handleFileUpload} disabled={loading} />
            </label>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="mb-6 relative">
          <input 
            type="text" 
            placeholder="Buscar por cliente..." 
            className="w-full bg-[#1f2937] p-4 rounded-2xl border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all pl-12"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <span className="absolute left-4 top-4 opacity-30">🔍</span>
        </div>

        {/* TABLA */}
        <div className="bg-[#1f2937] rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-700">
                  <th className="p-5">Nombre / Cliente</th>
                  <th className="p-5">Contacto / Puesto</th>
                  <th className="p-5">Teléfono / Email</th>
                  <th className="p-5">Ubicación</th>
                  <th className="p-5">Asesor Comercial</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-800">
                {currentItems.map((item) => (
                  <tr key={item.uuid} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="p-5 font-bold text-blue-400 uppercase">{item.cliente}</td>
                    <td className="p-5 text-xs text-gray-300">
                        <div className="font-bold uppercase">{item.contacto}</div>
                        <div className="text-gray-500 italic">{item.puesto}</div>
                    </td>
                    <td className="p-5 text-xs text-gray-300">
                        <div className="text-green-500 font-mono">{item.telefono}</div>
                        <div className="text-gray-500">{item.email}</div>
                    </td>
                    <td className="p-5 text-gray-400 text-xs">{item.ubicacion}</td>
                    <td className="p-5">
                      <select 
                        value={item.asesorcomercial} 
                        onChange={(e) => handleSelectAsesor(item.uuid, e.target.value)}
                        className="bg-[#0e1624] p-2 rounded-xl border border-gray-700 text-[11px] outline-none focus:border-blue-500 w-full"
                      >
                        <option value="">Sin asignar</option>
                        {activeUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="bg-gray-800/30 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length} registros
            </p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#0e1624] rounded-xl text-xs font-bold disabled:opacity-30 transition-all hover:bg-blue-600"
              >
                Anterior
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 shadow-lg' : 'bg-[#0e1624] hover:bg-gray-700'}`}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              </div>

              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#0e1624] rounded-xl text-xs font-bold disabled:opacity-30 transition-all hover:bg-blue-600"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer theme="dark" position="bottom-right" />
    </div>
  );
}