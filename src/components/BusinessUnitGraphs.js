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
  const [selectedPeriod, setSelectedPeriod] = useState('day'); // 'day', 'month', 'year', 'week'

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('/api/business-units/reports', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUnitReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

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

  const getPeriodData = () => {
    const filteredReports = unitReports.filter(report => {
      const date = new Date(report.createdAt);
      if (selectedPeriod === 'day') {
        return date.getDate() === new Date().getDate();
      } else if (selectedPeriod === 'week') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        return date >= startOfWeek;
      } else if (selectedPeriod === 'month') {
        return date.getMonth() === new Date().getMonth();
      } else if (selectedPeriod === 'year') {
        return date.getFullYear() === new Date().getFullYear();
      }
      return false;
    });

    const labels = filteredReports.map(report => new Date(report.createdAt).toLocaleDateString());
    const totals = filteredReports.map(report => report.total);

    return {
      labels,
      datasets: [
        {
          label: `Total Vendido por ${selectedPeriod}`,
          data: totals,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Unidad de Negocio', 20, 10);
    doc.autoTable({
      head: [['Unidad', 'Total Vendido']],
      body: unitReports.map(report => [report.name, report.total]),
    });
    doc.save('reportes_unidad_negocio.pdf');
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(unitReports.map(report => ({
      Unidad: report.name,
      'Total Vendido': report.total,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes');
    XLSX.writeFile(workbook, 'reportes_unidad_negocio.xlsx');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0e1624] text-white p-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Gráficas de Reportes</h1>

        {/* Botones de exportación */}
        <div className="flex justify-between mt-4">
          <button onClick={exportToPDF} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
            Exportar a PDF
          </button>
          <button onClick={exportToExcel} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Exportar a Excel
          </button>
        </div>

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
            <Bar data={getPeriodData()} options={{ maintainAspectRatio: false, aspectRatio: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
