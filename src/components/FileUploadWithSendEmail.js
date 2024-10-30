import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export default function FileUploadWithSendEmail() {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [clientEmails, setClientEmails] = useState([]); // Estado para almacenar emails de ClientList
  const [selectedEmail, setSelectedEmail] = useState(''); // Email seleccionado para enviar el archivo
  const [emailMessage, setEmailMessage] = useState(''); 

  // Cargar emails de clientes al montar el componente
  useEffect(() => {
    fetchClientEmails();
    fetchFiles();
  }, []);

  const fetchClientEmails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filtrar clientes cuya planta contenga "tarimas" y obtener sus emails
      const emails = response.data
        .filter((client) => client.planta && client.planta.toLowerCase().includes('tarimas'))
        .map((client) => client.email);

      setClientEmails(emails);
    } catch (error) {
      console.error('Error al obtener los emails de clientes:', error);
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
    if (!selectedEmail) {
      alert('Por favor selecciona un email para enviar el archivo');
      return;
    }

    try {
      await axios.post('/api/send-file-email', {
        email: selectedEmail,
        fileUrl: file.filepath,
        fileName: file.filename,
      });
      alert('Archivo enviado exitosamente a ' + selectedEmail);
    } catch (error) {
      console.error('Error al enviar archivo por correo:', error);
      alert('Hubo un error al enviar el archivo');
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
                    <div className="flex flex-col space-y-2 md:flex-row md:space-x-4">
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
                      {/* Enviar por correo */}
                      <select
                        value={selectedEmail}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        className="rounded bg-[#1f2937] text-white sm:text-base text-xs sm:px-4 sm:py-2 px-2 py-1"
                      >
                        <option value="">Seleccionar Email</option>
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
                    </div>
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Escribe un mensaje para el destinatario..."
                      className="mt-2 w-full rounded-md p-2 bg-[#1f2937] text-white text-sm"
                    />
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