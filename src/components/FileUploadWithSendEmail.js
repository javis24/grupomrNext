import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FileUploadWithSendEmail() {
  // Estado para manejar el archivo a subir
  const [file, setFile] = useState(null);
  // Lista de archivos en el servidor
  const [fileList, setFileList] = useState([]);
  // Para filtrar archivos (por nombre)
  const [searchTerm, setSearchTerm] = useState('');
  // Manejo de errores
  const [error, setError] = useState('');

  // Lista global de “plants”
  const [plants, setPlants] = useState([]);
  
  // Estado por archivo: { fileId: { selectedPlant, clientEmails, selectedEmails, emailMessage } }
  const [fileStates, setFileStates] = useState({});

  useEffect(() => {
    fetchPlants();
    fetchFiles();
  }, []);

  // ====================================================
  // 1. OBTENER LISTA DE PLANTAS
  // ====================================================
  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const uniquePlants = [...new Set(response.data.map((client) => client.planta))];
      setPlants(uniquePlants);
    } catch (error) {
      console.error('Error al obtener las plantas:', error);
    }
  };

  // ====================================================
  // 2. OBTENER LISTA DE ARCHIVOS
  // ====================================================
  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/mktfiles', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Genera la ruta pública si no viene (ej. secure_url en Cloudinary)
      const files = response.data.map((f) => ({
        ...f,
        filepath: f.filepath || `/uploads/${f.filename}`, 
      }));

      setFileList(files);

      // Inicializa un estado vacío/por defecto para cada archivo
      const newFileStates = {};
      files.forEach((f) => {
        newFileStates[f.id] = {
          selectedPlant: '',
          clientEmails: [],
          selectedEmails: [],
          emailMessage: '',
        };
      });
      setFileStates(newFileStates);

    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Hubo un problema al cargar los archivos.');
    }
  };

  // ====================================================
  // 3. SUBIR ARCHIVO
  // ====================================================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile || null);
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
      await axios.post('/api/mktfiles', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchFiles(); // recarga la lista
      setFile(null);
      alert('Archivo subido exitosamente');
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('Hubo un error al subir el archivo');
    }
  };

  // ====================================================
  // 4. ELIMINAR ARCHIVO
  // ====================================================
  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/mktfiles/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFiles();
      alert('Archivo eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      alert('Hubo un error al eliminar el archivo');
    }
  };

  // ====================================================
  // 5. SELECCIÓN DE PLANTA POR ARCHIVO
  // ====================================================
  const handlePlantSelection = async (fileId, plant) => {
    // 1) Actualiza la planta en el estado
    setFileStates((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        selectedPlant: plant,
      },
    }));

    if (!plant) {
      // Si se limpió la selección, vacía los emails
      setFileStates((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          clientEmails: [],
          selectedEmails: [],
        },
      }));
      return;
    }

    // 2) Carga emails de la DB en base a la planta
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const emails = response.data
        .filter((client) =>
          client.planta &&
          client.planta.toLowerCase() === plant.toLowerCase()
        )
        .map((client) => client.email);

      // 3) Actualiza los emails disponibles y limpia la selección
      setFileStates((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          clientEmails: emails,
          selectedEmails: [],
        },
      }));
    } catch (error) {
      console.error('Error al obtener los emails de clientes:', error);
    }
  };

  // ====================================================
  // 6. SELECCIONAR/DESSELECCIONAR EMAIL
  // ====================================================
  const toggleEmailSelection = (fileId, email) => {
    setFileStates((prev) => {
      const fileState = prev[fileId];
      const wasSelected = fileState.selectedEmails.includes(email);

      let newSelected;
      if (wasSelected) {
        // Si ya estaba, lo quitamos
        newSelected = fileState.selectedEmails.filter((e) => e !== email);
      } else {
        // Lo agregamos
        newSelected = [...fileState.selectedEmails, email];
      }

      return {
        ...prev,
        [fileId]: {
          ...fileState,
          selectedEmails: newSelected,
        },
      };
    });
  };

  // ====================================================
  // 7. MENSAJE POR ARCHIVO
  // ====================================================
  const handleMessageChange = (fileId, newMessage) => {
    setFileStates((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        emailMessage: newMessage,
      },
    }));
  };

  // ====================================================
  // 8. ENVIAR CORREO
  // ====================================================
  const handleSendEmail = async (file) => {
    if (!file || !file.filepath) {
      alert('No se ha seleccionado un archivo válido.');
      return;
    }

    const thisFileState = fileStates[file.id];
    if (!thisFileState) {
      alert('No se encontró información para este archivo.');
      return;
    }

    const { selectedEmails, emailMessage } = thisFileState;
    if (selectedEmails.length === 0) {
      alert('No hay correos seleccionados.');
      return;
    }

    const fileUrl = encodeURI(file.filepath);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/email/send-file-email',
        {
          emails: selectedEmails,
          filePath: fileUrl,
          fileName: file.filename,
          message: emailMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert('Correo enviado exitosamente.');
      } else {
        alert('Hubo un problema al enviar el correo.');
      }
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      alert('Hubo un error al enviar el correo.');
    }
  };

  // ====================================================
  // 9. FILTRAR ARCHIVOS Y ORDENAR
  // ====================================================
  const filteredFiles = fileList
    .filter((f) =>
      f.filename.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.filename.localeCompare(b.filename));

  // ====================================================
  // RENDER
  // ====================================================
  return (
    <div className="container mx-auto p-4 bg-[#0e1624] text-white min-h-screen flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Gestión de Archivos PDF con Envío de Correo
      </h2>

      <div className="w-full sm:w-auto mx-0 max-w-xs sm:max-w-full">
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
              {filteredFiles.map((file) => {
                // fileStates[file.id] contiene la info local para este archivo
                const fileState = fileStates[file.id] || {};
                return (
                  <tr key={file.id} className="hover:bg-[#4b5563]">
                    <td className="px-4 py-2">{file.filename}</td>
                    <td className="px-4 py-2">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col space-y-2 md:flex-row md:space-x-2">

                        {/* Descargar */}
                        <a
                          href={file.filepath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white rounded-md hover:bg-green-700 text-center 
                                     sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm"
                        >
                          Descargar
                        </a>

                        {/* Eliminar */}
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="bg-red-500 text-white rounded-md hover:bg-red-700 text-center 
                                     sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm"
                        >
                          Eliminar
                        </button>

                        {/* Select de Planta */}
                        <select
                          value={fileState.selectedPlant || ''}
                          onChange={(e) =>
                            handlePlantSelection(file.id, e.target.value)
                          }
                          className="rounded bg-[#1f2937] text-white sm:text-base text-xs sm:px-4 sm:py-2 px-2 py-1"
                        >
                          <option value="">Seleccionar Planta</option>
                          {plants.map((plant, index) => (
                            <option key={index} value={plant}>
                              {plant}
                            </option>
                          ))}
                        </select>

                        {/* Checkboxes de Emails */}
                        <div className="flex flex-col space-y-1">
                          {fileState.clientEmails?.map((email) => (
                            <label
                              key={email}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  fileState.selectedEmails?.includes(email)
                                }
                                onChange={() =>
                                  toggleEmailSelection(file.id, email)
                                }
                                className="form-checkbox"
                              />
                              <span className="text-xs sm:text-sm">{email}</span>
                            </label>
                          ))}
                        </div>

                        {/* Botón Enviar */}
                        <button
                          onClick={() => handleSendEmail(file)}
                          className="bg-blue-500 text-white rounded-md hover:bg-blue-700 text-center 
                                     sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm"
                        >
                          Enviar
                        </button>

                        {/* Textarea para Mensaje */}
                        <textarea
                          value={fileState.emailMessage || ''}
                          onChange={(e) =>
                            handleMessageChange(file.id, e.target.value)
                          }
                          placeholder="Mensaje opcional"
                          className="rounded bg-[#1f2937] text-white p-2 sm:text-sm text-xs mt-2"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
