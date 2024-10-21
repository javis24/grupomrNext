import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const units = [
  { name: 'Tarimas' },
  { name: 'Empaques' },
  { name: 'Alimentos' },
  { name: 'Sano' },
  { name: 'Composta' },
  { name: 'Plástico' },
  { name: 'Servicios' },
];

export default function BusinessUnitReports() {
  const [selectedUnit, setSelectedUnit] = useState(units[0].name); // Unidad seleccionada
  const [reports, setReports] = useState(
    units.reduce((acc, unit) => {
      acc[unit.name] = {
        salesTotalMonth: '',
        daysElapsed: '',
        dailyAvgSales: '',
        daysRemaining: '',
        projectedSales: '',
        lastYearSales: '',
        salesObjective: '',
        differenceObjective: '',
        remainingSales: '',
        remainingDailySales: '',
      };
      return acc;
    }, {})
  );

  useEffect(() => {
    fetchReportData();
  }, [selectedUnit]);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token'); // Recuperar el token JWT
      const response = await axios.get(`/api/business-units?unitName=${selectedUnit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const unitData = response.data;
      setReports((prevReports) => ({
        ...prevReports,
        [selectedUnit]: unitData,
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    calculateFields();
  }, [reports[selectedUnit]]);

  const calculateFields = () => {
    const currentReport = reports[selectedUnit];

    const dailyAvgSales = currentReport.salesTotalMonth && currentReport.daysElapsed
      ? (parseFloat(currentReport.salesTotalMonth) / parseFloat(currentReport.daysElapsed)).toFixed(2)
      : '';

    const projectedSales = dailyAvgSales
      ? (parseFloat(dailyAvgSales) * 30).toFixed(2)
      : '';

    const differenceObjective = currentReport.salesObjective && projectedSales
      ? (parseFloat(currentReport.salesObjective) - parseFloat(projectedSales)).toFixed(2)
      : '';

    const remainingSales = currentReport.salesObjective && currentReport.salesTotalMonth
      ? (parseFloat(currentReport.salesObjective) - parseFloat(currentReport.salesTotalMonth)).toFixed(2)
      : '';

    const remainingDailySales = remainingSales && currentReport.daysRemaining
      ? (parseFloat(remainingSales) / parseFloat(currentReport.daysRemaining)).toFixed(2)
      : '';

    setReports((prevReports) => ({
      ...prevReports,
      [selectedUnit]: {
        ...prevReports[selectedUnit],
        dailyAvgSales,
        projectedSales,
        differenceObjective,
        remainingSales,
        remainingDailySales,
      },
    }));
  };

  const handleInputChange = (field, value) => {
    setReports((prevReports) => ({
      ...prevReports,
      [selectedUnit]: {
        ...prevReports[selectedUnit],
        [field]: value,
      },
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const currentReport = reports[selectedUnit];

    // Agregar logo y el resto de los detalles del PDF
    const imgUrl = '/logo_mr.png';
    const image = new Image();
    image.src = imgUrl;

    image.onload = () => {
      doc.addImage(image, 'PNG', 20, 10, 40, 40);

      // Información del reporte
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: 'center' });
      doc.text("MRE040121UBA", 105, 37, { align: 'center' });

      // Encabezado del reporte
      doc.setFillColor(255, 204, 0); // Color amarillo
      doc.rect(160, 20, 40, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("REPORTE", 180, 27, null, 'center');

      // Fecha
      const today = new Date();
      const formattedDate = today.toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Fecha: ${formattedDate}`, 160, 42);

      // Datos del reporte
      const reportDetails = [
        ['Venta Total del Mes', `$ ${currentReport.salesTotalMonth}`],
        ['Días Transcurridos', currentReport.daysElapsed],
        ['Venta Diaria Promedio', `$ ${currentReport.dailyAvgSales}`],
        ['Días Faltantes del Mes', currentReport.daysRemaining],
        ['Venta Proyectada', `$ ${currentReport.projectedSales}`],
        ['Venta del Año Anterior', `$ ${currentReport.lastYearSales}`],
        ['Objetivo de Venta', `$ ${currentReport.salesObjective}`],
        ['Diferencia vs Objetivo', `$ ${currentReport.differenceObjective}`],
        ['Venta Total Faltante', `$ ${currentReport.remainingSales}`],
        ['Venta Diaria Faltante', `$ ${currentReport.remainingDailySales}`],
      ];

      doc.autoTable({
        body: reportDetails,
        startY: 50,
        theme: 'plain',
        styles: {
          cellPadding: 2,
          fontSize: 10,
        },
        columnStyles: {
          0: { halign: 'left', textColor: [0, 0, 0] },
          1: { halign: 'right', textColor: [0, 0, 0] },
        },
      });

      // Guardar el PDF
      doc.save(`${selectedUnit}-reporte.pdf`);
    };
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');  // Recuperar el token JWT
      const reportData = { ...reports[selectedUnit], unitName: selectedUnit };

      // Usar la nueva ruta para crear el reporte
      await axios.post('/api/business-units', reportData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Reporte para ${selectedUnit} enviado con éxito`);
    } catch (error) {
      alert('Error al enviar el reporte. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0e1624] text-white">
      <div className="w-full max-w-lg p-4 bg-[#1f2937] rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Reportes Unidad de Negocio</h1>

        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Seleccionar Unidad de Negocio</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full p-2 rounded bg-[#374151] text-white"
          >
            {units.map((unit) => (
              <option key={unit.name} value={unit.name}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-y-auto max-h-[500px]">
          <h2 className="text-xl font-bold mb-4">{selectedUnit} Reporte</h2>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Venta Total del Mes</label>
            <input
              type="number"
              value={reports[selectedUnit]?.salesTotalMonth || ''}
              onChange={(e) => handleInputChange('salesTotalMonth', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta Total del Mes"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Días Transcurridos</label>
            <input
              type="number"
              value={reports[selectedUnit].daysElapsed}
              onChange={(e) => handleInputChange('daysElapsed', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Días Transcurridos"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Venta Diaria Promedio</label>
            <input
              type="number"
              value={reports[selectedUnit].dailyAvgSales}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta Diaria Promedio"
              readOnly
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Días Faltantes del Mes</label>
            <input
              type="number"
              value={reports[selectedUnit].daysRemaining}
              onChange={(e) => handleInputChange('daysRemaining', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Días Faltantes del Mes"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Venta Proyectada</label>
            <input
              type="number"
              value={reports[selectedUnit].projectedSales}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta Proyectada"
              readOnly
            />
          </div>

          {/* Nuevos campos agregados */}

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Venta del Año Anterior</label>
            <input
              type="number"
              value={reports[selectedUnit].lastYearSales}
              onChange={(e) => handleInputChange('lastYearSales', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta del Año Anterior"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Objetivo de Venta</label>
            <input
              type="number"
              value={reports[selectedUnit].salesObjective}
              onChange={(e) => handleInputChange('salesObjective', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Objetivo de Venta"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Diferencia vs Objetivo</label>
            <input
              type="number"
              value={reports[selectedUnit].differenceObjective}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Diferencia vs Objetivo"
              readOnly
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Venta Total Faltante</label>
            <input
              type="number"
              value={reports[selectedUnit].remainingSales}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta Total Faltante"
              readOnly
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Venta Diaria Faltante</label>
            <input
              type="number"
              value={reports[selectedUnit].remainingDailySales}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta Diaria Faltante"
              readOnly
            />
          </div>

          {/* Botones para guardar los datos y generar PDF */}
          <div className="flex space-x-2">
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 w-full"
            >
              Guardar Datos
            </button>

            <button
              onClick={generatePDF}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
            >
              Generar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
