import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export default function UploadList() {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Obtener el token JWT del almacenamiento local
    const token = localStorage.getItem('token');
    
    if (token) {
      const decodedToken = jwt.decode(token); // Decodificamos el token
      setUserEmail(decodedToken.email); // Guardamos el email del usuario autenticado
    }
    
    fetchFiles(); // Cargamos la lista de archivos
  }, []);

  // Función para obtener la lista de archivos
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

  // Función para manejar la selección de archivo
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Función para subir el archivo
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
      fetchFiles(); // Actualizamos la lista de archivos después de subir
      setFile(null); // Limpiar la selección
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('Hubo un error al subir el archivo');
    }
  };

  // Función para eliminar un archivo
  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFiles(); // Actualizar la lista después de eliminar
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      alert('Hubo un error al eliminar el archivo');
    }
  };

  // Filtrar la lista de archivos por el término de búsqueda
  const filteredFiles = fileList.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 bg-[#0e1624] text-white min-h-screen flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-center">Gestión de Archivos PDF</h2>
      
      {/* Formulario para subir archivos */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex items-center">
          <input
            type="file"
            onChange={handleFileChange}
            className="border p-2 rounded-md mr-2 bg-[#1f2937] text-white"
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
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-[#4b5563]">
                  <td className="px-4 py-2">{file.filename}</td>
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
                      {/* Mostrar botón de eliminar solo para usuarios permitidos */}
                      {(userEmail === 'coordinadora@grupomrlaguna.com' || userEmail === 'mgaliano@grupomrlaguna.com') && (
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      )}
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
