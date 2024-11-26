import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FileUploadWithSendEmail() {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [clientEmails, setClientEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    fetchPlants();
    fetchFiles();
  }, []);

  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado.');
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const uniquePlants = [...new Set(response.data.map((client) => client.planta))];
      setPlants(uniquePlants);
    } catch (err) {
      console.error('Error al obtener las plantas:', err.message);
      setError('No se pudieron cargar las plantas.');
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado.');
      const response = await axios.get('/api/mktfiles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFileList(response.data);
    } catch (err) {
      console.error('Error al obtener archivos:', err.message);
      setError('No se pudieron cargar los archivos.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo antes de subir.');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', file); // Asegúrate de que el campo se llame 'image'
  
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado en localStorage.');
  
      await axios.post('/api/mktfiles', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      alert('Archivo subido exitosamente.');
      fetchFiles(); // Recargar los archivos
      setFile(null);
      setFileUrl('');
    } catch (err) {
      console.error('Error al subir archivo:', err.message);
      setError('Hubo un error al subir el archivo.');
    }
  };
  

  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado.');

      await axios.delete(`/api/mktfiles/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Archivo eliminado exitosamente.');
      fetchFiles();
    } catch (err) {
      console.error('Error al eliminar archivo:', err.message);
      setError('Hubo un error al eliminar el archivo.');
    }
  };

  const handleSendEmail = async (file) => {
    if (selectedEmails.length === 0) {
      alert('Por favor selecciona al menos un correo electrónico para enviar.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado.');

      await axios.post(
        '/api/email/send-file-email',
        {
          emails: selectedEmails,
          fileUrl: file.filepath,
          fileName: file.filename,
          message: emailMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Archivo enviado exitosamente.');
    } catch (err) {
      console.error('Error al enviar correo:', err.message);
      setError('Hubo un error al enviar el correo.');
    }
  };

  const handlePlantSelection = async (plant) => {
    setSelectedPlant(plant);

    if (plant) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        const response = await axios.get('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const emails = response.data
          .filter((client) => client.planta?.toLowerCase() === plant.toLowerCase())
          .map((client) => client.email);

        setClientEmails(emails);
      } catch (err) {
        console.error('Error al obtener los emails de clientes:', err.message);
        setError('No se pudieron cargar los emails.');
      }
    } else {
      setClientEmails([]);
    }
  };

  const toggleEmailSelection = (email) => {
    setSelectedEmails((prevSelected) =>
      prevSelected.includes(email)
        ? prevSelected.filter((e) => e !== email)
        : [...prevSelected, email]
    );
  };

  const filteredFiles = fileList
    .filter((file) => file.filename.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return (
    <div className="container mx-auto p-4 bg-[#0e1624] text-white min-h-screen flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-center">Gestión de Archivos y Correos</h2>

      <div className="flex flex-col sm:flex-row sm:justify-between mb-4">
        <div className="flex flex-col sm:flex-row sm:space-x-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="border p-2 rounded-md bg-[#1f2937] text-white"
          />
          {fileUrl && <img src={fileUrl} alt="Preview" className="w-32 mt-2 rounded-md" />}
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2 sm:mt-0"
          >
            Subir
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar archivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded-md bg-[#1f2937] text-white mt-2 sm:mt-0"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {filteredFiles.length === 0 ? (
        <p className="text-center mt-4">No hay archivos subidos.</p>
      ) : (
        <table className="table-auto w-full bg-[#1f2937] text-left">
          <thead>
            <tr className="bg-[#374151]">
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file.id} className="hover:bg-[#4b5563]">
                <td className="px-4 py-2">{file.filename}</td>
                <td className="px-4 py-2">{new Date(file.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => handleSendEmail(file)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2"
                  >
                    Enviar Correo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
