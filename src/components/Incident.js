import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function IncidentForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null); // Estado para la imagen
  const [message, setMessage] = useState(null);
  const [incidents, setIncidents] = useState([]);

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
    fetchIncidents();
  }, []);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      // Usamos FormData para enviar multipart/form-data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (image) {
        formData.append('image', image); // name="image" en formidable
      }

      const response = await axios.post('/api/incidents', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message);
      setTitle('');
      setDescription('');
      setImage(null);
      fetchIncidents();
    } catch (error) {
      console.error('Error al guardar la incidencia:', error);
      setMessage('Error al guardar la incidencia');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/incidents?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Incidencia eliminada correctamente.');
      fetchIncidents();
    } catch (error) {
      console.error('Error al eliminar la incidencia:', error);
      setMessage('Error al eliminar la incidencia.');
    }
  };

  // Generar PDF (igual que antes)
  const generateIncidentPDF = (incident) => {
    const doc = new jsPDF();
    // ... tu código actual para armar el PDF ...
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

          {/* Input para la imagen */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Imagen (opcional)</label>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0] || null)}
              className="w-full p-2 bg-gray-800 text-white rounded"
              accept="image/*"
            />
          </div>

          <div className="flex justify-center">
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Guardar
            </button>
          </div>
        </form>

        {/* Listado de Incidencias */}
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
                  <th className="text-left">Fecha</th>
                  <th className="text-left">Imagen</th>
                  <th className="text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id} className="border-t border-gray-700">
                    <td className="py-2">{incident.title}</td>
                    <td className="py-2">{incident.description}</td>
                    <td className="py-2">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>

                    {/* Mostrar la imagen si existe */}
                    <td className="py-2">
                      {incident.imageUrl ? (
                        <img
                          src={incident.imageUrl}
                          alt="Imagen del incidente"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">Sin imagen</span>
                      )}
                    </td>

                    <td className="py-2">
                      <button
                        onClick={() => generateIncidentPDF(incident)}
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600 mr-2"
                      >
                        Exportar PDF
                      </button>
                      <button
                        onClick={() => handleDelete(incident.id)}
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
