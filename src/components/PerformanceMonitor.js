import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
    FiUser, FiShoppingBag, FiActivity, FiPieChart, 
    FiTrendingDown, FiChevronDown, FiCalendar, FiDollarSign, FiUserPlus, FiMail 
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';

export default function PerformanceMonitor() {
    // 1. Estado unificado para recibir TODO el contenido de las APIs
    const [reportData, setReportData] = useState({ salesByUser: [], salesDetails: [] });
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('month');
    const [expandedUser, setExpandedUser] = useState(null);

    useEffect(() => {
        fetchFullReport();
    }, [range]);

    const fetchFullReport = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Esta API debe devolver el objeto completo con salesByUser y salesDetails
            const res = await axios.get(`/api/reports/performance?range=${range}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("Datos recibidos de la API:", res.data);
            setReportData(res.data);
        } catch (error) {
            console.error("Error API:", error);
            toast.error("Error al sincronizar datos reales");
        } finally {
            setLoading(false);
        }
    };

    // Función para calcular días de inactividad evitando el error "Infinity"
    const getInactivityDays = (date) => {
        if (!date || date === 'Nunca') return 0;
        try {
            const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
            return isNaN(diff) ? 0 : diff;
        } catch (e) { return 0; }
    };

    const totalVendidoGlobal = reportData.salesDetails?.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0) || 0;

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <ToastContainer theme="dark" />
            
            <div className="max-w-7xl mx-auto space-y-10">
                {/* HEADER GLOBAL */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700 shadow-2xl">
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-blue-500">Historial Maestro</h1>
                        <p className="text-gray-500 text-[10px] font-bold tracking-[0.4em] uppercase">Ventas y Actividad en Tiempo Real</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <select 
                            value={range} 
                            onChange={(e) => setRange(e.target.value)}
                            className="bg-[#0e1624] p-4 rounded-2xl border border-gray-700 outline-none text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="day">Hoy</option>
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mes</option>
                        </select>
                        <div className="bg-[#0e1624] p-4 rounded-2xl border border-gray-800 text-center min-w-[160px]">
                            <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Total recaudado</p>
                            <p className="text-xl font-black text-green-500">$ {totalVendidoGlobal.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* TABLA MAESTRA: AQUÍ VERÁS TODAS LAS VENTAS DE TODOS */}
                <div className="bg-[#1f2937] rounded-[2.5rem] border border-gray-700 shadow-2xl overflow-hidden">
                    <div className="p-6 bg-gray-800/20 border-b border-gray-800 flex justify-between items-center">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <FiActivity className="text-blue-500" /> Flujo Maestro de Operaciones
                        </h2>
                    </div>
                    <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-[#1f2937] text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                                <tr>
                                    <th className="p-5 text-center">Fecha</th>
                                    <th className="p-5">Asesor</th>
                                    <th className="p-5">Cliente</th>
                                    <th className="p-5 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {reportData.salesDetails?.length > 0 ? (
                                    reportData.salesDetails.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-blue-600/5 transition-all">
                                            <td className="p-5 text-center font-mono text-[10px] text-gray-500">
                                                {sale.fechaOperacion ? format(new Date(sale.fechaOperacion), 'dd/MM/yy') : '---'}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-500 uppercase">
                                                        {sale.userName?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase text-gray-300">{sale.userName || 'Sistema'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-xs font-black uppercase text-white truncate max-w-[150px]">
                                                {sale.clientName}
                                            </td>
                                            <td className="p-5 text-right font-black text-green-400 text-xs">
                                                $ {parseFloat(sale.total || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="p-10 text-center text-gray-600 uppercase text-[10px] font-black italic">No hay registros de ventas en este periodo</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* GRID DE CARDS: DESGLOSE INDIVIDUAL POR ASESOR */}
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-3">
                    <span className="h-[1px] w-10 bg-gray-800"></span> Desglose por Asesor
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reportData.salesByUser?.map((user) => (
                        <div key={user.userId} className="bg-[#1f2937] rounded-[2.5rem] border border-gray-700 p-8 hover:border-blue-500/50 transition-all shadow-2xl relative group overflow-hidden flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform text-blue-500">
                                            👤
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">{user.userName}</h3>
                                            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-1">Asesor Comercial</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <ActivityPill 
                                        icon={<FiShoppingBag/>} 
                                        label="Última Venta" 
                                        date={user.lastSaleDate} 
                                        days={getInactivityDays(user.lastSaleDate)} 
                                        limit={30} 
                                    />
                                    <ActivityPill 
                                        icon={<FiUserPlus/>} 
                                        label="Nuevo Cliente" 
                                        date={user.lastClientDate} 
                                        days={getInactivityDays(user.lastClientDate)} 
                                        limit={15} 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
                                    <div className="bg-[#0e1624] p-4 rounded-2xl border border-gray-800 text-center">
                                        <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Operaciones</p>
                                        <p className="text-lg font-black text-blue-400">{user.totalSales || 0}</p>
                                    </div>
                                    <div className="bg-[#0e1624] p-4 rounded-2xl border border-gray-800 text-center">
                                        <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Monto Total</p>
                                        <p className="text-lg font-black text-green-500">$ {Math.round(user.totalVendido || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-6 bg-[#0e1624] hover:bg-blue-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Enviar Recordatorio
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const ActivityPill = ({ icon, label, date, days, limit }) => (
    <div className="bg-[#0e1624] p-3 rounded-2xl border border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="text-blue-500 opacity-50">{icon}</div>
            <div>
                <p className="text-[8px] font-black text-gray-500 uppercase">{label}</p>
                <p className="text-[10px] font-bold text-gray-300">{date && date !== 'Nunca' ? format(new Date(date), 'dd MMM yyyy') : 'Sin registro'}</p>
            </div>
        </div>
        {(days > limit && date && date !== 'Nunca') ? (
            <span className="text-[8px] font-black text-red-500 animate-pulse bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20 uppercase">
                ¡INACTIVO!
            </span>
        ) : (
            <span className="text-[8px] font-black text-green-500 opacity-40 uppercase">Vigente</span>
        )}
    </div>
);