import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export default function UploadList() {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState('Documento 1'); // Estado para el tipo de archivo

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwt.decode(token);
      setUserEmail(decodedToken.email);
    }
    fetchFiles();
  }, []);

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
    if (selectedFile) {
      // Verificar el prefijo del nombre de archivo
      const filename = selectedFile.name.toLowerCase();
      if (filename.startsWith('ordende')) {
        setFileType('Orden Compra');
      } else {
        setFileType('Documento 1');
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType); // Añadir el tipo de archivo

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/files', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchFiles();
      setFile(null);
      alert('Archivo subido exitosamente');
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('Hubo un error al subir el archivo');
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFiles();
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      alert('Hubo un error al eliminar el archivo');
    }
  };

// Archivos filtrados por término de búsqueda
const filteredFiles = fileList.filter((file) =>
  file.filename.toLowerCase().includes(searchTerm.toLowerCase())
);

// Clasificar los archivos en "Documento 1" y "Ordenes de Compra" basados en el prefijo en el nombre del archivo
const documents = filteredFiles.filter(file => !file.filename.toLowerCase().startsWith('ordende'));
const orders = filteredFiles.filter(file => file.filename.toLowerCase().startsWith('ordende'));


  return (
    <div className="container mx-auto p-4 bg-[#0e1624] text-white min-h-screen flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-center">Gestión de Archivos PDF</h2>
      
      {/* Formulario para subir archivos */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
      {!['tarimas@grupomrlaguna.com', 'logistica@grupomrlaguna.com', 'facturacion@grupomrlaguna.com' ].includes(userEmail) && (
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
          )}

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

       {/* Mostrar "Documento 1" solo para usuarios distintos a tarimas@grupomrlaguna.com */}
       {!['tarimas@grupomrlaguna.com', 'logistica@grupomrlaguna.com', 'facturacion@grupomrlaguna.com' ].includes(userEmail) && (
        <>
      {/* Tabla de Documentos 1 */}
      <h3 className="text-xl font-semibold mt-4 mb-2">Documento 1</h3>
      {documents.length === 0 ? (
        <p className="text-center mt-4">No hay documentos subidos.</p>
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
              {documents.map((file) => (
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
       </>
      )}    
      
      

      {/* Tabla de Ordenes de Compra */}
      <h3 className="text-xl font-semibold mt-4 mb-2">Ordenes de Compra</h3>
      {orders.length === 0 ? (
        <p className="text-center mt-4">No hay ordenes de compra subidas.</p>
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
              {orders.map((file) => (
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
