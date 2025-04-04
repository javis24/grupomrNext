import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export default function ClientPrices() {
  const [clientsData, setClientsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedAsesorExport, setSelectedAsesorExport] = useState("");

  // Al montar, obtenemos la lista actual
  useEffect(() => {
    fetchPrices();
    fetchUsers();
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


  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveUsers(response.data); 
      // Asumo que response.data es un array de objetos 
      // con algo como { id: 123, name: 'Juan', ... }
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
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

  const handleSelectAsesor = async (uuid, newAsesor) => {
    try {
      // 1. Actualizamos localmente (en el front) para feedback inmediato.
      const newData = [...clientsData];
      // Busca el índice del cliente que coincida con el uuid
      const index = newData.findIndex((c) => c.uuid === uuid);
      if (index !== -1) {
        newData[index] = {
          ...newData[index],
          asesorcomercial: newAsesor,
        };
        setClientsData(newData);
      }
  
      // 2. Llamamos PUT a la API para guardar en la DB
      await axios.put("/api/client-prices", {
        uuid,
        asesorcomercial: newAsesor,
      });
  
      toast.success("Asesor comercial asignado correctamente.");
    } catch (err) {
      console.error("Error al asignar asesor:", err);
      toast.error("Error al asignar asesor comercial.");
    }
  };
  // Asesores distintos que aparecen en la tabla
  const asesoresEnTabla = Array.from(
    new Set(
      clientsData
        .map((c) => c.asesorcomercial)
        .filter((a) => a && a.trim() !== "")
    )
  );


  // Exportar a PDF
  // === Exportación a PDF adaptando tu estilo con logo, encabezados, etc. ===
  const handleExportPDF = () => {
    if (!selectedAsesorExport) {
      toast.info("Selecciona un asesor para exportar.");
      return;
    }

    // Filtrar los clientes de ese asesor
    const dataToExport = clientsData.filter(
      (item) => item.asesorcomercial === selectedAsesorExport
    );
    if (dataToExport.length === 0) {
      toast.warn("No hay registros con ese asesor comercial.");
      return;
    }

    // Crea el doc
    const doc = new jsPDF();

    // Cargamos la imagen (logo)
    const imgUrl = "/logo_mr.png"; // Ajustar ruta según tu proyecto
    const image = new Image();
    image.src = imgUrl;

    // Cuando cargue la imagen, generamos todo
    image.onload = () => {
      // Agregar logo
      doc.addImage(image, "PNG", 20, 10, 20, 20);

      // Encabezado de la empresa
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: "center" });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: "center" });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: "center" });
      doc.text("MRE040121UBA", 105, 37, { align: "center" });

      // Sección / título de reporte
      doc.setFillColor(255, 204, 0); // Amarillo
      doc.rect(160, 20, 40, 10, "F");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("REPORTE", 180, 27, { align: "center" });

      // Aquí agregas el texto del asesor comercial
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      // Por ejemplo, centrado en x=105, y=45
      doc.text(`Asesor Comercial: ${selectedAsesorExport}`, 105, 45, { align: "center" });

      // Ajusta 'startY' un poco más abajo, para que la tabla no se empalme
      let startY = 55;

      // Creamos las filas para autoTable
      // Cada fila es un array de valores, como en tu PDF masivo
      const rows = dataToExport.map((client, index) => [
        index + 1,
        client.cliente,
        client.contacto,
        client.email,
        client.telefono,
        client.ubicacion,
        client.rfc,
      ]);

      // Definimos las columnas
      const columns = [
        { header: "#", dataKey: "num" },
        { header: "Cliente", dataKey: "cliente" },
        { header: "Contacto", dataKey: "contacto" },
        { header: "Email", dataKey: "email" },
        { header: "Teléfono", dataKey: "telefono" },
        { header: "Ubicación", dataKey: "ubicacion" },
        { header: "RFC", dataKey: "rfc" },
      ];

      // Generamos la tabla con estilo similar a tu diseño “single client”
      doc.autoTable({
        startY,
        head: [columns.map((col) => col.header)],
        body: rows,
        theme: "plain", // se asemeja al 'plain' que usabas
        styles: {
          cellPadding: 1,
          fontSize: 10,
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 10 }, // el # un poco pequeño
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
          6: { cellWidth: 30 },
        },
      });

      // Finalmente, descargamos el PDF con un nombre personalizado
      doc.save(`Clientes_${selectedAsesorExport}.pdf`);
    };
  };

  
  

  return (
    <div className="p-4 bg-[#0e1624] text-white min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Cartera de Clientes Disponibles</h1>

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

        {/* Select para exportar a PDF los clientes de X asesor */}
      <div className="mb-4 flex items-center space-x-2">
        <label>Exportar clientes de:</label>
        <select
          value={selectedAsesorExport}
          onChange={(e) => setSelectedAsesorExport(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded"
        >
          <option value="">-- Seleccionar asesor --</option>
          {asesoresEnTabla.map((asesor) => (
            <option key={asesor} value={asesor}>
              {asesor}
            </option>
          ))}
        </select>
        <button onClick={handleExportPDF} className="bg-green-600 px-4 py-2 rounded">
          Exportar a PDF
        </button>
      </div>

      <div className="flex min-h-screen bg-[#0e1624] text-white">
        <main className="flex-1 p-4">
          <h1 className="text-2xl mb-4">Cartera de Clientes Disponibles</h1>

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
                  <td className="border px-4 py-2"> 
                    <select
                      value={item.asesorcomercial}
                      onChange={(e) => handleSelectAsesor(item.uuid, e.target.value)}
                      className="bg-gray-700 text-white p-2 rounded"
                    >
                      <option value="">-- Selecciona asesor --</option>
                      {activeUsers.map((user) => (
                        <option key={user.id} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </td>
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
