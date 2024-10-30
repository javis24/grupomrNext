import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FileUploadWithSendEmail() {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [plants, setPlants] = useState([]); // Estado para almacenar las plantas
  const [selectedPlant, setSelectedPlant] = useState(''); // Planta seleccionada
  const [clientEmails, setClientEmails] = useState([]); // Emails de clientes basados en la planta seleccionada
  const [emailMessage, setEmailMessage] = useState(''); // Mensaje personalizado para el email

  // Cargar plantas y archivos al montar el componente
  useEffect(() => {
    fetchPlants();
    fetchFiles();
  }, []);

  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Obtener una lista única de plantas
      const uniquePlants = [...new Set(response.data.map((client) => client.planta))];
      setPlants(uniquePlants);
    } catch (error) {
      console.error('Error al obtener las plantas:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/files', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFileList(response.data);
    } catch (error) {
      console.error('Error al obtener archivos:', error);
      setError('Hubo un problema al cargar los archivos.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile || null); // Guardar el archivo si está seleccionado
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/files', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchFiles(); // Recargar la lista de archivos
      setFile(null); // Limpiar el archivo después de la subida
      alert('Archivo subido exitosamente');
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('Hubo un error al subir el archivo');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFiles(); // Recargar la lista de archivos
      alert('Archivo eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      alert('Hubo un error al eliminar el archivo');
    }
  };

  const handleSendEmail = async (file) => {
    if (clientEmails.length === 0) {
      alert('No hay emails seleccionados para enviar el archivo');
      return;
    }

    try {
      await axios.post('/api/send-file-email', {
        emails: clientEmails, // Enviar a todos los emails seleccionados
        fileUrl: file.filepath,
        fileName: file.filename,
        message: emailMessage, // Agregar el mensaje personalizado al enviar
      });
      alert('Archivo enviado exitosamente a todos los emails seleccionados');
    } catch (error) {
      console.error('Error al enviar archivo por correo:', error);
      alert('Hubo un error al enviar el archivo');
    }
  };

  const handlePlantSelection = async (plant) => {
    setSelectedPlant(plant);

    if (plant) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filtrar emails de los clientes que tienen la planta seleccionada
        const emails = response.data
          .filter((client) => client.planta && client.planta.toLowerCase() === plant.toLowerCase())
          .map((client) => client.email);

        setClientEmails(emails); // Seleccionar automáticamente todos los emails de la planta
      } catch (error) {
        console.error('Error al obtener los emails de clientes:', error);
      }
    } else {
      setClientEmails([]);
    }
  };

  const filteredFiles = fileList
    .filter((file) =>
      file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.filename.localeCompare(b.filename)); // Ordenar archivos por nombre

  return (
    <div className="container mx-auto p-4 bg-[#0e1624] text-white min-h-screen flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-center">Gestión de Archivos PDF con Envío de Correo</h2>

      <div className="w-full sm:w-auto mx-0 max-w-xs sm:max-w-full">
        {/* Formulario para subir archivos */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-4 mb-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2">
            <input
              type="file"
              onChange={handleFileChange}
              className="border p-2 rounded-md bg-[#1f2937] text-white w-full sm:w-auto"
            />
            <button
              onClick={handleUpload}
              className="bg-blue-500 text-white rounded-md hover:bg-blue-700 px-4 py-2 text-sm"
            >
              Subir
            </button>
          </div>

          {/* Buscador */}
          <div className="flex flex-col w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar archivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border p-2 rounded-md bg-[#1f2937] text-white w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Tabla de archivos */}
      {filteredFiles.length === 0 ? (
        <p className="text-center mt-4">No hay archivos subidos.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#1f2937] text-left rounded-lg border border-gray-600">
            <thead>
              <tr className="bg-[#374151]">
                <th className="px-4 py-2">Nombre del Archivo</th>
                <th className="px-4 py-2">Fecha de Subida</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-[#4b5563]">
                  <td className="px-4 py-2">{file.filename}</td>
                  <td className="px-4 py-2">{new Date(file.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col space-y-2 md:flex-row md:space-x-2">
                      <a
                        href={file.filepath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white rounded-md hover:bg-green-700 text-center 
                                   sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm"
                      >
                        Descargar
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="bg-red-500 text-white rounded-md hover:bg-red-700 text-center 
                                   sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm"
                      >
                        Eliminar
                      </button>
                      {/* Selección de planta */}
                      <select
                        value={selectedPlant}
                        onChange={(e) => handlePlantSelection(e.target.value)}
                        className="rounded bg-[#1f2937] text-white sm:text-base text-xs sm:px-4 sm:py-2 px-2 py-1"
                      >
                        <option value="">Seleccionar Planta</option>
                        {plants.map((plant, index) => (
                          <option key={index} value={plant}>
                            {plant}
                          </option>
                        ))}
                      </select>
                      {/* Enviar por correo */}
                      <select
                        multiple
                        value={clientEmails}
                        className="rounded bg-[#1f2937] text-white sm:text-base text-xs sm:px-4 sm:py-2 px-2 py-1"
                        disabled={!selectedPlant} // Deshabilitar si no se selecciona una planta
                      >
                        {clientEmails.map((email, index) => (
                          <option key={index} value={email}>
                            {email}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSendEmail(file)}
                        className="bg-blue-500 text-white rounded-md hover:bg-blue-700 text-center 
                                   sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm"
                      >
                        Enviar
                      </button>
                      <textarea
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Mensaje opcional"
                        className="rounded bg-[#1f2937] text-white p-2 sm:text-sm text-xs mt-2"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
