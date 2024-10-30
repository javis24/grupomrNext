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
      const emails = response.data.map((client) => client.email); // Solo extraemos emails
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
      
      {/* Formulario para subir archivos */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            onChange={handleFileChange}
            className="border p-2 rounded-md bg-[#1f2937] text-white"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700"
          >
            Subir Archivo
          </button>
        </div>

        {/* Buscador */}
        <div className="mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Buscar archivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-md bg-[#1f2937] text-white"
          />
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
                    <div className="flex space-x-4">
                      <a
                        href={file.filepath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white p-2 rounded-md hover:bg-green-700"
                      >
                        Descargar
                      </a>
                      {/* Enviar por correo */}
                      <select
                        value={selectedEmail}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        className="p-2 rounded bg-[#1f2937] text-white"
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
                        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700"
                      >
                        Enviar
                      </button>
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
