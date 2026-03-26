import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiAlertCircle, FiUser, FiShoppingBag, FiUserPlus, 
    FiPieChart, FiTrendingDown, FiClock 
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';

export default function UserActivityReport() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivityReport();
    }, []);

    const fetchActivityReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/reports/user-activity', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportData(res.data);
        } catch (error) {
            toast.error("Error al cargar el reporte de actividad");
        } finally {
            setLoading(false);
        }
    };

    // Función para calcular días de inactividad
    const getInactivityDays = (date) => {
        if (!date) return Infinity;
        const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Renderizado de alertas visuales
    const renderAlert = (days, limit) => {
        if (days > limit) {
            return (
                <span className="flex items-center gap-1 text-red-500 font-black animate-pulse text-[10px]">
                    <FiTrendingDown /> ¡INACTIVO! ({days} días)
                </span>
            );
        }
        return <span className="text-green-500 text-[10px] font-bold">Activo ({days} d)</span>;
    };

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <ToastContainer theme="dark" />
            
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-blue-500">
                            Monitor de Rendimiento
                        </h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">
                            Alertas de Actividad de Asesores
                        </p>
                    </div>
                    <div className="bg-[#1f2937] p-4 rounded-2xl border border-gray-700 flex gap-6">
                        <div className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-black">Ventas</p>
                            <p className="text-sm font-bold text-red-500">+30 días</p>
                        </div>
                        <div className="text-center border-l border-gray-700 pl-6">
                            <p className="text-[10px] text-gray-500 uppercase font-black">Nuevos Clientes</p>
                            <p className="text-sm font-bold text-orange-500">+15 días</p>
                        </div>
                    </div>
                </div>

                {/* Grid de Usuarios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportData.map((user) => {
                        const saleInactivity = getInactivityDays(user.lastSaleDate);
                        const clientInactivity = getInactivityDays(user.lastClientDate);

                        return (
                            <div key={user.id} className="bg-[#1f2937] rounded-[2rem] border border-gray-700 p-6 hover:border-blue-500/50 transition-all shadow-xl group">
                                {/* Info del Usuario */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <FiUser size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase text-sm tracking-tight">{user.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Asesor Comercial</p>
                                    </div>
                                </div>

                                {/* Métricas de Alerta */}
                                <div className="space-y-4 mb-6">
                                    <div className="bg-[#0e1624] p-4 rounded-2xl border border-gray-800">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[10px] text-gray-400 font-black uppercase flex items-center gap-2">
                                                <FiShoppingBag className="text-blue-500"/> Última Venta
                                            </p>
                                            {renderAlert(saleInactivity, 30)}
                                        </div>
                                        <p className="text-xs font-mono text-gray-300">{user.lastSaleDate || 'Nunca'}</p>
                                    </div>

                                    <div className="bg-[#0e1624] p-4 rounded-2xl border border-gray-800">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[10px] text-gray-400 font-black uppercase flex items-center gap-2">
                                                <FiUserPlus className="text-green-500"/> Nuevo Cliente
                                            </p>
                                            {renderAlert(clientInactivity, 15)}
                                        </div>
                                        <p className="text-xs font-mono text-gray-300">{user.lastClientDate || 'Nunca'}</p>
                                    </div>
                                </div>

                                {/* Estado de Prospectos */}
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase mb-3 flex items-center gap-2">
                                        <FiPieChart /> Embudo de Prospectos
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-gray-800/50 p-2 rounded-xl text-center">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Seguim.</p>
                                            <p className="text-sm font-black text-blue-400">{user.prospectsStats?.seguimiento || 0}</p>
                                        </div>
                                        <div className="bg-[#0e1624] p-4 rounded-2xl border border-gray-800">
                                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">📅 Próxima/Última Cita</p>
                                            <p className="text-xs font-bold text-blue-400">{user.lastAppointmentDate || 'Sin citas'}</p>
                                        </div>
                                        <div className="bg-[#0e1624] p-4 rounded-2xl border border-gray-800">
                                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">💰 Volumen de Ventas</p>
                                            <p className="text-xs font-bold text-green-500">{user.totalSales} Ventas Realizadas</p>
                                        </div>
                                        <div className="bg-gray-800/50 p-2 rounded-xl text-center">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Propu.</p>
                                            <p className="text-sm font-black text-yellow-500">{user.prospectsStats?.propuesta || 0}</p>
                                        </div>
                                        <div className="bg-gray-800/50 p-2 rounded-xl text-center border border-green-500/20">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Cerrados</p>
                                            <p className="text-sm font-black text-green-500">{user.prospectsStats?.cerrado || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón de Acción */}
                                <button 
                                    onClick={() => window.location.href = `mailto:${user.email}`}
                                    className="w-full mt-6 bg-gray-800 hover:bg-blue-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Enviar Recordatorio
                                </button>
                            </div>
                        );
                    })}
                </div>

                {reportData.length === 0 && !loading && (
                    <div className="text-center py-20 opacity-30 italic">
                        No se encontró actividad de usuarios para reportar.
                    </div>
                )}
            </div>
        </div>
    );
}