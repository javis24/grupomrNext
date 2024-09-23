import { useState } from 'react'; 
import axios from 'axios';

const units = [
  { name: 'Tarimas' },
  { name: 'Empaques' },
  { name: 'Alimentos' },
  { name: 'Sano' },
  { name: 'Composta' },
  { name: 'Plástico' },
];

export default function BusinessUnitReports() {
  const [selectedUnit, setSelectedUnit] = useState(units[0].name); // Unidad de negocio seleccionada
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
        remainingDailySales: ''
      };
      return acc;
    }, {})
  );

  const handleInputChange = (field, value) => {
    setReports({
      ...reports,
      [selectedUnit]: {
        ...reports[selectedUnit],
        [field]: value,
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');  // Recupera el token JWT

      // Construir los datos para enviar al backend
      const reportData = {
        ...reports[selectedUnit], // Todos los campos de reporte
        unitName: selectedUnit,  // Incluimos el nombre de la unidad
      };

      // Enviar los datos al backend
      const response = await axios.post('/api/business-units/reports', reportData, {
        headers: {
          'Authorization': `Bearer ${token}`  // Incluye el token en el encabezado
        }
      });

      console.log(`Reporte para ${selectedUnit} enviado con éxito:`, response.data);
      alert(`Reporte para ${selectedUnit} enviado con éxito`);
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      alert('Error al enviar el reporte. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0e1624] text-white">
      <div className="w-full max-w-lg p-4 bg-[#1f2937] rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Reportes Unidad de Negocio</h1>

        {/* Select para cambiar la unidad de negocio */}
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

        {/* Formulario para la unidad de negocio seleccionada */}
        <div className="overflow-y-auto max-h-[500px]">
          <h2 className="text-xl font-bold mb-4">{selectedUnit} Reporte</h2>

          {/* Campos adicionales similares a la imagen */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Venta Total del Mes</label>
            <input
              type="number"
              value={reports[selectedUnit].salesTotalMonth}
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
              onChange={(e) => handleInputChange('dailyAvgSales', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta Diaria Promedio"
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
              onChange={(e) => handleInputChange('projectedSales', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta Proyectada"
            />
          </div>

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
              onChange={(e) => handleInputChange('differenceObjective', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Diferencia vs Objetivo"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Venta Total Faltante</label>
            <input
              type="number"
              value={reports[selectedUnit].remainingSales}
              onChange={(e) => handleInputChange('remainingSales', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta Total Faltante"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Venta Diaria Faltante</label>
            <input
              type="number"
              value={reports[selectedUnit].remainingDailySales}
              onChange={(e) => handleInputChange('remainingDailySales', e.target.value)}
              className="w-full p-2 rounded bg-[#374151] text-white"
              placeholder="Venta Diaria Faltante"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
          >
            Enviar Reporte
          </button>
        </div>
      </div>
    </div>
  );
}
