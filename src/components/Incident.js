import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function IncidentForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState(null);
  const [incidents, setIncidents] = useState([]); // Estado para almacenar las incidencias

  // Función para obtener las incidencias guardadas
  const fetchIncidents = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/incidents', {
        headers: {
          'Authorization': `Bearer ${token}`,
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
      const response = await axios.post('/api/incidents/', {
        title,
        description,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setMessage(response.data.message);
      setTitle('');
      setDescription('');
      fetchIncidents(); // Recargar las incidencias después de guardar una nueva
    } catch (error) {
      console.error('Error al guardar la incidencia:', error);
      setMessage('Error al guardar la incidencia');
    }
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
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="py-2">{incident.title}</td>
                    <td className="py-2">{incident.description}</td>
                    <td className="py-2">{new Date(incident.createdAt).toLocaleDateString()}</td> {/* Mostrar la fecha de creación */}
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
