import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { 
    FiUploadCloud, FiFileText, FiTrash2, FiDownload, FiSearch, 
    FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';

export default function UploadList() {
    const [file, setFile] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [userRole, setUserRole] = useState(''); // Estado para el rol
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwt.decode(token);
                // Extraemos el rol del token (asegúrate de que tu backend envíe "role")
                setUserRole(decodedToken.role);
            } catch (e) { console.error("Error al decodificar el token"); }
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
            toast.error('Error al cargar archivos');
        }
    };

    const handleUpload = async () => {
        if (!file) return toast.warning('Selecciona un archivo PDF');
        setIsLoading(true);

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
            fetchFiles();
            setFile(null);
            toast.success('Archivo subido');
        } catch (error) {
            toast.error('Error al subir');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (fileId, filename) => {
        if (!window.confirm(`¿Eliminar permanentemente: ${filename}?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            setFileList(prev => prev.filter(f => f.id !== fileId));
            toast.info("Archivo eliminado");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al eliminar');
        }
    };

    const filteredFiles = fileList.filter((f) =>
        f.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- LÓGICA DE PERMISOS POR ROL ---
    const isAdmin = userRole === 'admin';
    // Todos pueden subir, pero solo el admin puede borrar.

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <ToastContainer theme="dark" position="bottom-right" />
            <div className="max-w-5xl mx-auto">
                
                {/* CABECERA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black uppercase italic text-blue-500 tracking-tighter">Biblioteca</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Documentos de {userRole}</p>
                    </div>
                    
                    <div className="relative w-full md:w-72">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="BUSCAR..." 
                            className="w-full bg-[#1f2937] border border-gray-700 rounded-2xl p-4 pl-12 text-xs uppercase outline-none focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* AREA DE SUBIDA */}
                <div className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700 mb-12 shadow-2xl flex flex-col md:flex-row items-center gap-6">
                    <label className="flex-1 w-full flex items-center gap-4 bg-[#0e1624] p-4 rounded-2xl border border-gray-700 cursor-pointer hover:border-blue-500 transition-all group">
                        <FiUploadCloud className="text-blue-500 text-2xl" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-black uppercase">Adjuntar documento</span>
                            <span className="text-xs text-white font-bold truncate max-w-[250px]">{file ? file.name : "Seleccionar PDF"}</span>
                        </div>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".pdf" />
                    </label>

                    <button 
                        onClick={handleUpload} 
                        disabled={isLoading || !file}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {isLoading ? "SUBIENDO..." : <><FiCheckCircle/> SUBIR</>}
                    </button>
                </div>

                {/* TABLA */}
                <div className="bg-[#1f2937] rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-[#111827] text-gray-500 font-black uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="p-6">Nombre del Archivo</th>
                                    <th className="p-6">Fecha</th>
                                    <th className="p-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {filteredFiles.length > 0 ? (
                                    filteredFiles.map((f) => (
                                        <tr key={f.id} className="hover:bg-white/5 transition-all group">
                                            <td className="p-6 flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                    <FiFileText size={16}/>
                                                </div>
                                                <span className="font-bold text-gray-300 group-hover:text-white uppercase truncate max-w-[350px]">{f.filename}</span>
                                            </td>
                                            <td className="p-6 text-gray-500">
                                                {new Date(f.createdAt || Date.now()).toLocaleDateString('es-MX')}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex justify-end gap-2">
                                                    <a href={f.filepath} target="_blank" rel="noreferrer"
                                                        className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-lg">
                                                        <FiDownload size={14}/>
                                                    </a>
                                                    
                                                    {/* BOTÓN ELIMINAR SOLO PARA ADMINISTRADOR */}
                                                    {isAdmin && (
                                                        <button 
                                                            onClick={() => handleDelete(f.id, f.filename)}
                                                            className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg"
                                                        >
                                                            <FiTrash2 size={14}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="p-20 text-center text-gray-600 uppercase font-black text-[10px] tracking-widest opacity-20">
                                            <FiAlertCircle className="mx-auto mb-2" size={40}/>
                                            Sin registros
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}