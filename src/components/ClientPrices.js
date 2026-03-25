import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import { FiTrash2, FiUpload, FiCheck, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ClientPrices() {
  const [dataToSave, setDataToSave] = useState([]); // Vista previa del Excel
  const [dbData, setDbData] = useState([]); // Datos reales de la DB
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchFromDB(); }, []);

  const fetchFromDB = async () => {
    try {
      const res = await axios.get("/api/client-prices");
      setDbData(res.data);
    } catch (err) { toast.error("Error al cargar base de datos"); }
  };

const handleExcel = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const bstr = evt.target.result;
    const wb = XLSX.read(bstr, { type: "binary" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // Mapeo refinado basado en la estructura de Microsip
    const cleanData = json.slice(1)
      .filter(row => row[0]) // Filtra filas donde el nombre del cliente esté vacío
      .map((row, index) => ({
        uuid: `temp-${index}-${Date.now()}`,
        cliente: String(row[0] || "").trim(),
        contacto: String(row[1] || "").trim(),    // <-- CAPTURA CONTACTO
        puesto: String(row[2] || "").trim(),
        telefono: String(row[3] || "").trim(),
        email: String(row[5] || "").trim(),
        ubicacion: String(row[6] || "").trim(),   // <-- CAPTURA UBICACIÓN
      }));

    setDataToSave(cleanData);
    setCurrentPage(1);
    toast.info("Vista previa cargada con Contactos y Ubicaciones.");
  };
  reader.readAsBinaryString(file);
};
  const saveAll = async () => {
    setLoading(true);
    try {
      await axios.post("/api/client-prices", { clients: dataToSave });
      toast.success("¡Datos sincronizados correctamente!");
      setDataToSave([]); 
      fetchFromDB(); 
    } catch (err) { toast.error("Error al guardar"); }
    finally { setLoading(false); }
  };

  const deleteOne = async (uuid) => {
    if (!window.confirm("¿Eliminar este cliente definitivamente?")) return;
    try {
      // Si es temporal (del excel), solo lo quitamos del estado local
      if (uuid.startsWith('temp-')) {
        setDataToSave(dataToSave.filter(item => item.uuid !== uuid));
      } else {
        // Si es de la DB, llamamos a la API
        await axios.delete("/api/client-prices", { data: { uuid } });
        setDbData(dbData.filter(item => item.uuid !== uuid));
        toast.success("Registro eliminado");
      }
    } catch (err) { toast.error("No se pudo eliminar"); }
  };

  // Lógica de visualización combinada
  const activeData = dataToSave.length > 0 ? dataToSave : dbData;
  const filteredData = activeData.filter(item => 
    item.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
      <ToastContainer theme="dark" position="bottom-right" />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER Y ACCIONES */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#1f2937] p-6 rounded-3xl border border-gray-700 shadow-xl gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase italic text-blue-500">Clientes Microsip</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              {dataToSave.length > 0 ? "⚠️ Estás viendo una vista previa" : "Mostrando registros guardados"}
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {dataToSave.length > 0 ? (
              <>
                <button onClick={saveAll} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg">
                  <FiCheck /> CONFIRMAR Y GUARDAR
                </button>
                <button onClick={() => setDataToSave([])} className="flex items-center justify-center bg-gray-700 hover:bg-red-600 p-3 rounded-2xl transition-all" title="Cancelar subida">
                  <FiX />
                </button>
              </>
            ) : (
              <label className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold cursor-pointer transition-all">
                <FiUpload /> SUBIR EXCEL
                <input type="file" hidden onChange={handleExcel} accept=".xlsx,.xls" />
              </label>
            )}
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="relative">
          <input 
            type="text" placeholder="Filtrar por nombre..."
            className="w-full bg-[#1f2937] p-4 rounded-2xl border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all pl-12"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <span className="absolute left-4 top-4 text-xl opacity-30">🔍</span>
        </div>

        {/* TABLA */}
        <div className="bg-[#1f2937] rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-700">
                <tr>
                  <th className="p-5">Nombre / Cliente</th>
                  <th className="p-5">Contacto / Teléfono</th>
                  <th className="p-5">Ubicación / Email</th>
                  <th className="p-5 text-center">Acción</th>
                </tr>
              </thead>
             <tbody className="divide-y divide-gray-800">
  {currentItems.map((item) => (
    <tr key={item.uuid} className="hover:bg-blue-500/5 transition-all">
      <td className="p-5">
        <div className="font-bold text-blue-400 uppercase text-xs">{item.cliente}</div>
        {/* Mostramos la UBICACIÓN debajo del nombre del cliente en pequeño */}
        <div className="text-[10px] text-gray-500 mt-1 uppercase italic">{item.ubicacion || 'Sin ubicación'}</div>
      </td>
      <td className="p-5 text-xs">
        {/* Mostramos el CONTACTO resaltado */}
        <div className="text-gray-200 font-semibold">{item.contacto || 'N/A'}</div>
        <div className="text-green-500 font-mono mt-1">{item.telefono}</div>
      </td>
      <td className="p-5 text-xs">
        <div className="text-gray-400">{item.email || 'Sin correo'}</div>
        <div className="text-[10px] text-gray-600 mt-1 uppercase">{item.puesto}</div>
      </td>
      <td className="p-5 text-center">
        <button 
          onClick={() => deleteOne(item.uuid)}
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl transition-all"
        >
          <FiTrash2 />
        </button>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>

          {/* PAGINADOR */}
          <div className="p-5 flex justify-between items-center border-t border-gray-800 bg-gray-800/20">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Página {currentPage} de {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 bg-[#0e1624] border border-gray-700 rounded-xl disabled:opacity-20 hover:border-blue-500 transition-all"
              >
                <FiChevronLeft />
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 bg-[#0e1624] border border-gray-700 rounded-xl disabled:opacity-20 hover:border-blue-500 transition-all"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}