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
  const [reports, setReports] = useState(
    units.reduce((acc, unit) => {
      acc[unit.name] = { description: '', total: '' };
      return acc;
    }, {})
  );

  const handleInputChange = (unitName, field, value) => {
    setReports({
      ...reports,
      [unitName]: {
        ...reports[unitName],
        [field]: value,
      },
    });
  };

  const handleSubmit = async (unitName) => {
    try {
      const token = localStorage.getItem('token');  // Recupera el token JWT

      // Construir los datos para enviar al backend
      const reportData = {
        description: reports[unitName].description,
        total: reports[unitName].total,
        unitName: unitName,  // Incluimos el nombre de la unidad
      };

      // Enviar los datos al backend
      const response = await axios.post('/api/business-units/reports', reportData, {
        headers: {
          'Authorization': `Bearer ${token}`  // Incluye el token en el encabezado
        }
      });

      console.log(`Reporte para ${unitName} enviado con éxito:`, response.data);
      alert(`Reporte para ${unitName} enviado con éxito`);
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      alert('Error al enviar el reporte. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="p-8 bg-[#0e1624] text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Reportes Unidad de Negocio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {units.map((unit) => (
          <div key={unit.name} className="bg-[#1f2937] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">{unit.name}</h2>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Descripción</label>
              <textarea
                value={reports[unit.name].description}
                onChange={(e) => handleInputChange(unit.name, 'description', e.target.value)}
                className="w-full p-2 rounded bg-[#374151] text-white"
                rows="4"
                placeholder="Describe lo vendido"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Total Vendido</label>
              <input
                type="number"
                value={reports[unit.name].total}
                onChange={(e) => handleInputChange(unit.name, 'total', e.target.value)}
                className="w-full p-2 rounded bg-[#374151] text-white"
                placeholder="Total vendido en el día"
              />
            </div>
            <button
              onClick={() => handleSubmit(unit.name)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
            >
              Enviar Reporte
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
