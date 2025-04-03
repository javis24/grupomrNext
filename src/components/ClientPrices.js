import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

export default function ClientPrices() {
  const [clientsData, setClientsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Al montar, obtenemos la lista actual
  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch("/api/client-prices");
      const data = await response.json();
      setClientsData(data);
    } catch (error) {
      console.error("Error al obtener precios:", error);
    }
  };

  // Maneja la carga de un archivo Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Lee como array de arrays
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false,
          defval: "",
        });

        // Omite la primera fila (asumiendo que son encabezados)
        const dataWithoutHeader = jsonData.slice(1);

        // Filtro para descartar filas totalmente vacías
        const filteredData = dataWithoutHeader.filter((row) => {
          return row.some((cell) => {
            if (typeof cell !== "string") return !!cell;
            return cell.trim() !== "";
          });
        });

        // Mapea cada fila a un objeto con los campos de tu modelo
        const formattedData = filteredData.map((row) => ({
          cliente: row[0] || "",
          asesorcomercial: row[1] || "",
          contacto: row[2] || "",
          email: row[3] || "",
          telefono: row[4] || "",
          ubicacion: row[5] || "",
          rfc: row[6] || "",
        }));

        // Envía al backend vía POST
        const response = await axios.post("/api/client-prices", {
          clients: formattedData,
        });
        if (response.status === 201) {
          toast.success("Datos cargados y guardados correctamente.");
          // Refrescamos la lista desde la DB
          fetchPrices();
        }
      } catch (error) {
        console.error("Error al procesar el archivo:", error);
        toast.error("Error al procesar el archivo.");
      }
    };

    reader.readAsBinaryString(file);
  };

  // Eliminar un registro por uuid
  const handleDelete = async (uuid) => {
    if (!uuid) return;
    try {
      const resp = await axios.delete("/api/client-prices", {
        data: { uuid },
      });
      if (resp.status === 200) {
        toast.success("Registro eliminado correctamente.");
        // Recargamos la lista
        fetchPrices();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar el registro.");
    }
  };

  // === FILTRO LOCAL POR 'cliente' ===
  // Convertimos ambos a minúsculas para que no importe si
  // el usuario escribió mayúsculas o minúsculas.
  const filteredData = clientsData.filter((item) =>
    item.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-[#0e1624] text-white min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Precios de Clientes</h1>

      {/* Cargar archivo Excel */}
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="bg-blue-500 text-white p-2 rounded mb-4"
      />

      {/* Input para buscar por 'cliente' */}
      <input
        type="text"
        placeholder="Buscar por nombre de cliente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 rounded text-black"
      />

      <div className="flex min-h-screen bg-[#0e1624] text-white">
        <main className="flex-1 p-4">
          <h1 className="text-2xl mb-4">Precios de Clientes</h1>

          {/* Si quieres, muestra cuántos registros (filtrados) hay */}
          <p className="mb-2">Total registros mostrados: {filteredData.length}</p>

          <table className="w-full bg-gray-800">
            <thead>
              <tr>
                <th className="border px-4 py-2">#</th>
                <th className="border px-4 py-2">Cliente</th>
                <th className="border px-4 py-2">Asesor Comercial</th>
                <th className="border px-4 py-2">Contacto</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Teléfono</th>
                <th className="border px-4 py-2">Ubicación</th>
                <th className="border px-4 py-2">RFC</th>
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.uuid}>
                  {/* Muestra un contador local */}
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{item.cliente}</td>
                  <td className="border px-4 py-2">{item.asesorcomercial}</td>
                  <td className="border px-4 py-2">{item.contacto}</td>
                  <td className="border px-4 py-2">{item.email}</td>
                  <td className="border px-4 py-2">{item.telefono}</td>
                  <td className="border px-4 py-2">{item.ubicacion}</td>
                  <td className="border px-4 py-2">{item.rfc}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleDelete(item.uuid)}
                      className="bg-red-600 px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </main>
      </div>
    </div>
  );
}
