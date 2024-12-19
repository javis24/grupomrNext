import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Registra los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BusinessUnitGraphs() {
  const [unitReports, setUnitReports] = useState([]);
  const [importedFiles, setImportedFiles] = useState([]); // Estado para almacenar los archivos importados
  const [selectedFile, setSelectedFile] = useState(null); // Estado para almacenar el archivo seleccionado
  const [selectedPeriod, setSelectedPeriod] = useState('day'); // 'day', 'month', 'year', 'week'

  // Obtener los archivos importados cuando se carga el componente
  useEffect(() => {
    const fetchReportsAndFiles = async () => {
      const token = localStorage.getItem('token');
      try {
        // Obtener los reportes
        const reportResponse = await axios.get('/api/business-graficas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUnitReports(reportResponse.data);
  
        // Suponiendo que la API de `/api/business-graficas/index` ya devuelve los archivos importados
        // si no, tendrías que hacer una petición adicional a una ruta de archivos importados
        const filesResponse = await axios.get('/api/business-graficas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setImportedFiles(filesResponse.data); // Actualiza los archivos importados
      } catch (error) {
        console.error('Error fetching reports or files:', error);
      }
    };
  
    fetchReportsAndFiles();
  }, []);

   useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      try {
        // Obtener los reportes
        const reportResponse = await axios.get('/api/business-graficas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUnitReports(reportResponse.data);
  
        // Obtener los archivos importados
        const filesResponse = await axios.get('/api/business-graficas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setImportedFiles(filesResponse.data);  // Actualiza el estado con los archivos importados
      } catch (error) {
        console.error('Error fetching reports or files:', error);
      }
    };
  
    fetchReports();
  }, []);
  

  // Procesa y guarda el archivo cuando se hace clic en "Guardar"
  const handleSave = () => {
    if (!selectedFile) {
      console.error("No file selected");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Procesar los datos del archivo
      const updatedReports = jsonData.map((row) => ({
        name: row['Unidad'] || '',
        total: row['Total Vendido'] || 0,
        createdAt: new Date().toISOString(), // Generar una fecha actual
        userId: 8 // Aquí puedes poner el ID del usuario actual
      }));

      setUnitReports(updatedReports); // Actualizar los datos localmente para graficar

      // Enviar los datos al backend para guardarlos en la base de datos
      try {
        const token = localStorage.getItem('token'); // Obtener el token de autenticación si es necesario
        await axios.post('/api/business-graficas', { reports: updatedReports }, {
          headers: {
            'Authorization': `Bearer ${token}`, // Asegúrate de enviar el token si es requerido
          },
        });
        console.log('Datos importados y guardados exitosamente');
        setSelectedFile(null); // Reinicia el archivo seleccionado después de guardar
      } catch (error) {
        console.error('Error guardando los datos importados:', error);
      }
    };

    reader.readAsArrayBuffer(selectedFile); // Lee el archivo seleccionado
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Unidad de Negocio', 20, 10);
    doc.autoTable({
      head: [['Unidad', 'Total Vendido']],
      body: unitReports.map(report => [report.name, report.total]),
    });
    doc.save('reportes_unidad_negocio.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(unitReports.map(report => ({
      Unidad: report.name,
      'Total Vendido': report.total,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes');
    XLSX.writeFile(workbook, 'reportes_unidad_negocio.xlsx');
  };

  const getUnitData = () => {
    const labels = unitReports.map(report => report.name); // Nombres de las unidades de negocio
    const totals = unitReports.map(report => report.total); // Totales vendidos

    return {
      labels,
      datasets: [
        {
          label: 'Total Vendido',
          data: totals,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

     // Función para descargar un archivo
  const downloadFile = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/download-file/${file.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Esto asegura que el archivo se descargue como un blob
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${file.name}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
    }
  };


  const deleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/business-graficas/${fileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setImportedFiles(importedFiles.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
    }
  };

  // Nueva función para manejar la carga de archivos Excel y graficar
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedData = jsonData.map((row) => ({
        name: row['Unidad'] || 'Sin Nombre',
        total: row['Total Vendido'] || 0,
      }));

      setUnitReports(processedData);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0e1624] text-white p-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Gráficas de Reportes</h1>

        {/* Botones de exportación */}        
        <div className="flex justify-between mt-4">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={(e) => {
              setSelectedFile(e.target.files[0]);
              handleFileUpload(e);
            }} 
            className="bg-gray-700 text-white p-2 rounded" 
          />
          <button onClick={() => exportToPDF()} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
            Exportar a PDF
          </button>
          <button onClick={() => exportToExcel()} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Exportar a Excel
          </button>
        </div>

        {/* Botón para guardar */}
        {selectedFile && (
          <div className="flex justify-center mt-4">
            <button 
              onClick={handleSave} 
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Guardar
            </button>
          </div>
        )}

        {/* Gráfica de ventas por unidad de negocio */}
        <div className="mb-6">
          <h2 className="text-xl mb-4 text-center">Total Vendido por Unidad de Negocio</h2>
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <Bar data={getUnitData()} options={{ maintainAspectRatio: false, aspectRatio: 2 }} />
          </div>
        </div>

        {/* Barra de selección de periodo */}
        <div className="flex justify-center space-x-4 mb-4">
          <button onClick={() => handlePeriodChange('day')} className={`p-2 rounded ${selectedPeriod === 'day' ? 'bg-blue-500' : 'bg-gray-500'}`}>
            1D
          </button>
          <button onClick={() => handlePeriodChange('week')} className={`p-2 rounded ${selectedPeriod === 'week' ? 'bg-blue-500' : 'bg-gray-500'}`}>
            1W
          </button>
          <button onClick={() => handlePeriodChange('month')} className={`p-2 rounded ${selectedPeriod === 'month' ? 'bg-blue-500' : 'bg-gray-500'}`}>
            1M
          </button>
          <button onClick={() => handlePeriodChange('year')} className={`p-2 rounded ${selectedPeriod === 'year' ? 'bg-blue-500' : 'bg-gray-500'}`}>
            1Y
          </button>
        </div>

        {/* Gráfica de ventas por día/mes/año */}
        <div className="mb-4">
          <h2 className="text-lg mb-0 text-center">Total Vendido por Periodo</h2>
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <Bar data={getUnitData()} options={{ maintainAspectRatio: false, aspectRatio: 3 }} />
          </div>
        </div>

        {/* Lista de archivos importados */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg mb-4 text-center">Archivos Excel Importados</h2>
          {importedFiles.length === 0 ? (
            <p className="text-center text-gray-400">No se han importado archivos aún.</p>
          ) : (
            <table className="w-full text-left table-auto">
              <thead>
                <tr>
                  <th className="p-2 text-gray-200 border-b border-gray-600">Nombre del Reporte</th>
                  <th className="p-2 text-gray-200 border-b border-gray-600">Fecha</th>
                  <th className="p-2 text-gray-200 border-b border-gray-600">Descarga</th>
                </tr>
              </thead>
              <tbody>
                {importedFiles.map((file, index) => (
                  <tr key={index} className="hover:bg-gray-700">
                    <td className="p-2 border-b border-gray-600">{file.name}</td>
                    <td className="p-2 border-b border-gray-600">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 border-b border-gray-600">
                      <button
                        onClick={() => downloadFile(file)}
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                      >
                        Descargar
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
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
