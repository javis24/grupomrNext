import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function IncidentForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState(null);
  const [incidents, setIncidents] = useState([]);

  // Función para obtener las incidencias guardadas
  const fetchIncidents = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/incidents', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIncidents(response.data);
    } catch (error) {
      console.error('Error al obtener las incidencias:', error);
    }
  };

  useEffect(() => {
    // Llamamos a la función para cargar las incidencias al montar el componente
    fetchIncidents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/incidents/',
        {
          title,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      setTitle('');
      setDescription('');
      fetchIncidents(); // Recargar las incidencias después de guardar una nueva
    } catch (error) {
      console.error('Error al guardar la incidencia:', error);
      setMessage('Error al guardar la incidencia');
    }
  };

  // Función para generar el PDF de una incidencia específica
  const generateIncidentPDF = (incident) => {
    const doc = new jsPDF();

    // Información de la empresa
    doc.setFontSize(12);
    doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
    doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: 'center' });
    doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: 'center' });
    doc.text("MRE040121UBA", 105, 37, { align: 'center' });

    // Encabezado de Incidencias
    doc.setFillColor(255, 204, 0); // Color amarillo
    doc.rect(160, 20, 40, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('INCIDENCIA', 180, 27, null, 'center');

    // Fecha de generación del PDF
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.text(`Fecha: ${currentDate}`, 160, 42);

    // Información de la incidencia
    doc.setFontSize(12);
    doc.text(`Título: ${incident.title}`, 20, 60);
    doc.text(`Descripción: ${incident.description}`, 20, 70);
    doc.text(`Fecha de Creación: ${new Date(incident.createdAt).toLocaleDateString()}`, 20, 80);

    // Observaciones
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(255, 204, 0);
    doc.rect(14, 100, 182, 10, 'F');
    doc.text('OBSERVACIONES', 105, 107, null, 'center');

    const observations = [
      'Las incidencias registradas se mantendrán durante 30 días.',
      'Revise regularmente el estado de las incidencias para asegurarse de que se resuelvan.',
      'Para más información, contacte al departamento correspondiente.',
    ];

    // Centrar las observaciones
    observations.forEach((obs, index) => {
      const obsTextWidth = doc.getTextWidth(obs);
      doc.text(105 - obsTextWidth / 2, 115 + index * 6, obs);
    });

    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Materiales Reutilizables S.A. de C.V.', 105, 280, null, 'center');
    doc.text('www.materialesreutilizables.com', 105, 285, null, 'center');

    // Guardar el PDF
    doc.save(`incidencia_${incident.createdAt}.pdf`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0e1624] text-white p-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Registrar Incidencia</h1>
        <form onSubmit={handleSubmit} className="bg-[#1f2937] p-6 rounded-lg shadow-lg">
          {message && <p className="mb-4 text-center">{message}</p>}
          <div className="mb-4">
            <label className="block text-sm mb-2">Título de la Incidencia</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-800 text-white rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-gray-800 text-white rounded"
              required
            />
          </div>
          <div className="flex justify-center">
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Guardar
            </button>
          </div>
        </form>

        {/* Tabla con las incidencias guardadas */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mt-6">
          <h2 className="text-xl mb-4">Listado de Incidencias</h2>
          {incidents.length === 0 ? (
            <p className="text-center text-gray-400">No hay incidencias registradas.</p>
          ) : (
            <table className="w-full text-white">
              <thead>
                <tr>
                  <th className="text-left">Título</th>
                  <th className="text-left">Descripción</th>
                  <th className="text-left">Fecha de Creación</th>
                  <th className="text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="py-2">{incident.title}</td>
                    <td className="py-2">{incident.description}</td>
                    <td className="py-2">{new Date(incident.createdAt).toLocaleDateString()}</td>
                    <td className="py-2">
                      <button
                        onClick={() => generateIncidentPDF(incident)}
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                      >
                        Exportar PDF
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
