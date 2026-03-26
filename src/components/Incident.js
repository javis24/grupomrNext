import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
    FiAlertTriangle, FiPlus, FiTrash2, FiFileText, 
    FiImage, FiCalendar, FiUser, FiCheckCircle, FiSend 
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';

export default function IncidentForm() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        incidentDate: '',
        entityName: '',
        correctivePlan: '',
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [incidents, setIncidents] = useState([]);

    const fetchIncidents = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/incidents', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIncidents(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => { fetchIncidents(); }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (image) data.append('image', image);

            await axios.post('/api/incidents', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Incidencia registrada");
            setFormData({ title: '', description: '', incidentDate: '', entityName: '', correctivePlan: '' });
            setImage(null);
            fetchIncidents();
        } catch (error) {
            toast.error("Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar incidencia?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/incidents?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Eliminado");
            fetchIncidents();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const generateIncidentPDF = (incident) => {
        const doc = new jsPDF();
        doc.setFillColor(31, 41, 55);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text("REPORTE DE INCIDENCIA", 105, 20, { align: 'center' });
        doc.autoTable({
            startY: 40,
            head: [['Campo', 'Información']],
            body: [
                ["TÍTULO", incident.title],
                ["ENTIDAD", incident.entityName],
                ["FECHA", incident.incidentDate],
                ["DESCRIPCIÓN", incident.description],
                ["PLAN", incident.correctivePlan]
            ],
            theme: 'grid'
        });
        doc.save(`Reporte_${incident.title}.pdf`);
    };

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <ToastContainer theme="dark" position="bottom-right" />
            
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Adaptable */}
                <div className="flex items-center gap-3 md:gap-4 bg-[#1f2937] p-4 md:p-6 rounded-3xl border border-gray-700 shadow-xl">
                    <div className="bg-red-500/20 p-3 rounded-2xl text-red-500">
                        <FiAlertTriangle size={28} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none">Incidencias</h1>
                        <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Calidad y Mejora Continua</p>
                    </div>
                </div>

                {/* Formulario Optimizado */}
                <form onSubmit={handleSubmit} className="bg-[#1f2937] p-5 md:p-8 rounded-[2rem] border border-gray-700 shadow-2xl space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-4">
                            <InputField label="Título" name="title" value={formData.title} onChange={handleInputChange} icon={<FiAlertTriangle/>} required />
                            <InputField label="Cliente / Proveedor" name="entityName" value={formData.entityName} onChange={handleInputChange} icon={<FiUser/>} required />
                            <InputField label="Fecha" name="incidentDate" type="date" value={formData.incidentDate} onChange={handleInputChange} icon={<FiCalendar/>} required />
                        </div>
                        
                        <div className="flex flex-col">
                             <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest mb-1">Descripción del Problema</label>
                             <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="flex-1 w-full bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 min-h-[120px] transition-all"
                                required
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest mb-1 flex items-center gap-2">
                                <FiCheckCircle className="text-green-500"/> Plan Correctivo
                            </label>
                            <textarea 
                                name="correctivePlan"
                                value={formData.correctivePlan}
                                onChange={handleInputChange}
                                className="w-full bg-[#0e1624] border border-gray-700 rounded-2xl p-4 text-sm outline-none focus:border-green-500 min-h-[100px] transition-all"
                                required
                            />
                        </div>

                        <div className="flex flex-col justify-end gap-3">
                            <div className="relative">
                                <input type="file" onChange={(e) => setImage(e.target.files[0])} className="hidden" id="file-upload" accept="image/*" />
                                <label htmlFor="file-upload" className="flex items-center justify-center w-full p-4 bg-[#0e1624] border-2 border-dashed border-gray-700 rounded-2xl cursor-pointer hover:border-blue-500 transition-all text-gray-500 text-sm italic">
                                    <FiImage className="mr-2" /> {image ? image.name : "Subir Evidencia"}
                                </label>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                <FiSend /> {loading ? "Guardando..." : "Registrar"}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Listado Adaptable (Cards en móvil, Tabla en Desktop) */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 ml-2">Historial de Reportes</h2>
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-[#1f2937] rounded-3xl border border-gray-700 overflow-hidden shadow-xl">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                <tr>
                                    <th className="p-5">Incidencia</th>
                                    <th className="p-5">Fecha</th>
                                    <th className="p-5">Evidencia</th>
                                    <th className="p-5 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {incidents.map((incident) => (
                                    <tr key={incident.id} className="hover:bg-blue-500/5 transition-all">
                                        <td className="p-5">
                                            <div className="font-bold text-blue-400 uppercase text-xs">{incident.title}</div>
                                            <div className="text-[10px] text-gray-500 mt-1 uppercase">{incident.entityName}</div>
                                        </td>
                                        <td className="p-5 text-xs text-gray-400">{incident.incidentDate}</td>
                                        <td className="p-5">
                                            {incident.imageUrl ? (
                                                <img src={incident.imageUrl} className="w-10 h-10 object-cover rounded-lg border border-gray-700" alt="Img" />
                                            ) : <span className="text-[10px] opacity-20">N/A</span>}
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => generateIncidentPDF(incident)} className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white p-3 rounded-xl transition-all"><FiFileText /></button>
                                                <button onClick={() => handleDelete(incident.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl transition-all"><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {incidents.map((incident) => (
                            <div key={incident.id} className="bg-[#1f2937] p-5 rounded-3xl border border-gray-700 shadow-lg space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="max-w-[70%]">
                                        <h3 className="font-black text-blue-400 uppercase text-sm leading-tight">{incident.title}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase mt-1 tracking-widest">{incident.entityName}</p>
                                    </div>
                                    <span className="text-[10px] bg-[#0e1624] px-3 py-1 rounded-full text-gray-400 border border-gray-800">
                                        {incident.incidentDate}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                    <div className="flex gap-2">
                                        <button onClick={() => generateIncidentPDF(incident)} className="flex items-center gap-2 bg-green-600/20 text-green-500 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                            <FiFileText /> PDF
                                        </button>
                                        <button onClick={() => handleDelete(incident.id)} className="flex items-center gap-2 bg-red-600/20 text-red-500 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                            <FiTrash2 /> Borrar
                                        </button>
                                    </div>
                                    {incident.imageUrl && (
                                        <img src={incident.imageUrl} className="w-10 h-10 object-cover rounded-xl border border-gray-700" alt="Img" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {incidents.length === 0 && (
                        <div className="text-center py-10 opacity-30 text-xs font-bold uppercase">No hay reportes registrados</div>
                    )}
                </div>
            </div>
        </div>
    );
}

const InputField = ({ label, icon, ...props }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest flex items-center gap-2">
            {icon} {label}
        </label>
        <input 
            className="w-full bg-[#0e1624] border border-gray-700 rounded-2xl p-3 text-sm outline-none focus:border-blue-500 transition-all text-white"
            {...props}
        />
    </div>
);