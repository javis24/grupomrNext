import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BusinessUnitGraphs() {
  const [unitReports, setUnitReports] = useState([]);
  const [importedFiles, setImportedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/business-graficas", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("Archivos recibidos desde la API:", response.data);
        setImportedFiles(response.data);
      } catch (error) {
        console.error("Error al obtener los reportes:", error.response?.data || error.message);
      }
    };
  
    fetchReports();
  }, []);
  

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Por favor selecciona un archivo");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/business-graficas", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Actualizar los datos de la gráfica con los datos procesados del Excel
      setUnitReports(
        response.data.data.map((item) => ({
          name: item["Unidad"] || "Sin Nombre", // Ajustar columnas según el Excel
          total: item["Total Vendido"] || 0,
        }))
      );
  
      alert("Archivo subido y datos graficados correctamente");
    } catch (error) {
      console.error("Error al subir el archivo:", error.response?.data || error.message);
      alert("Error al subir el archivo");
    }
  };
  

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Unidad de Negocio", 20, 10);
    doc.autoTable({
      head: [["Unidad", "Total Vendido"]],
      body: unitReports.map((report) => [report.name, report.total]),
    });
    doc.save("reportes_unidad_negocio.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      unitReports.map((report) => ({
        Unidad: report.name,
        "Total Vendido": report.total,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reportes");
    XLSX.writeFile(workbook, "reportes_unidad_negocio.xlsx");
  };

  const getUnitData = () => {
    const labels = unitReports.map((report) => report.name);
    const totals = unitReports.map((report) => report.total);

    return {
      labels,
      datasets: [
        {
          label: "Total Vendido",
          data: totals,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };


  const downloadFile = async (fileId, fallbackName = "archivo.xlsx") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/business-graficas/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
  
      const fileName =
        response.headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || fallbackName;
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar el archivo:", error.response?.data || error.message);
      alert("Error al descargar el archivo");
    }
  };
  
    
  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/business-graficas/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Actualizar la lista de archivos después de eliminar
      setImportedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      alert("Archivo eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el archivo:", error.response?.data || error.message);
      alert("Error al eliminar el archivo");
    }
  };
  

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#0e1624] text-white p-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Gráficas de Reportes</h1>

        <div className="flex justify-between mt-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="bg-gray-700 text-white p-2 rounded"
          />
          <button
            onClick={handleFileUpload}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Subir y Graficar
          </button>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={exportToPDF}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Exportar a PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Exportar a Excel
          </button>
        </div>

        <div className="mb-6 mt-4">
          <h2 className="text-xl mb-4 text-center">Total Vendido por Unidad de Negocio</h2>
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <Bar data={getUnitData()} options={{ maintainAspectRatio: false, aspectRatio: 2 }} />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg mt-4">
          <h2 className="text-lg mb-4 text-center">Archivos Subidos</h2>
          {importedFiles.length === 0 ? (
            <p className="text-center text-gray-400">No se han subido archivos aún.</p>
          ) : (
            <table className="w-full text-left table-auto">
              <thead>
                <tr>
                  <th className="p-2 text-gray-200 border-b border-gray-600">Nombre del Archivo</th>
                  <th className="p-2 text-gray-200 border-b border-gray-600">Fecha de Subida</th>
                  <th className="p-2 text-gray-200 border-b border-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {importedFiles.map((file, index) => (
                  <tr key={file.id || index} className="hover:bg-gray-700">
                    <td className="p-2 border-b border-gray-600">{file.name || "Sin Nombre"}</td>
                    <td className="p-2 border-b border-gray-600">
                      {file.createdAt ? new Date(file.createdAt).toLocaleString() : "Fecha no disponible"}
                    </td>
                    <td className="p-2 border-b border-gray-600 flex space-x-2">
                      <button
                        onClick={() => downloadFile(file.id, file.name)}
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                      >
                        Descargarr
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
