import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SalesDashboard = () => {
    const [data, setData] = useState(null);
    const [range, setRange] = useState('month'); 
    const [expandedUser, setExpandedUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Obtenemos los datos del usuario logueado desde el localStorage
        const user = JSON.parse(localStorage.getItem('user')) || { name: 'Asesor', role: 'user' };
        setCurrentUser(user);
        fetchStats();
    }, [range]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/reports/performance?range=${range}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            
            // Si el usuario es asesor, expandimos su detalle automáticamente
            if (res.data?.salesByUser?.length === 1) {
                setExpandedUser(res.data.salesByUser[0].userId);
            }
        } catch (err) {
            console.error("Error al cargar reporte");
        }
    };

    const totalVendidoGlobal = data?.salesDetails?.reduce((acc, curr) => acc + parseFloat(curr.total), 0) || 0;
    const totalVentasGlobal = data?.salesDetails?.length || 0;

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* HEADER DINÁMICO */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-500">
                            {currentUser?.role === 'admin' ? 'Rendimiento Global' : 'Mi Rendimiento Personal'}
                        </h1>
                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">
                            Bienvenido, <span className="text-white">{currentUser?.name}</span>
                        </p>
                    </div>
                    
                    <select 
                        value={range} 
                        onChange={(e) => setRange(e.target.value)}
                        className="bg-[#1f2937] p-3 rounded-xl border border-gray-700 outline-none text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="day">Hoy</option>
                        <option value="week">Esta Semana</option>
                        <option value="month">Este Mes</option>
                    </select>
                </div>

                {/* TARJETAS DE RESUMEN */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#1f2937] p-6 rounded-3xl border border-gray-800 shadow-2xl">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {currentUser?.role === 'admin' ? 'Ventas Totales' : 'Mi Venta Total'}
                        </p>
                        <h3 className="text-3xl font-black mt-2 text-green-400">${totalVendidoGlobal.toLocaleString()}</h3>
                    </div>
                    <div className="bg-[#1f2937] p-6 rounded-3xl border border-gray-800 shadow-2xl">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Operaciones Realizadas</p>
                        <h3 className="text-3xl font-black mt-2 text-blue-400">{totalVentasGlobal}</h3>
                    </div>
                    <div className="bg-[#1f2937] p-6 rounded-3xl border border-gray-800 shadow-2xl">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Clientes Nuevos</p>
                        <h3 className="text-3xl font-black mt-2 text-yellow-500">
                            {data?.clients?.reduce((acc, curr) => acc + curr.clientesRegistrados, 0) || 0}
                        </h3>
                    </div>
                </div>

                {/* LISTADO POR USUARIO (ADMIN VE TODOS, ASESOR SE VE A SÍ MISMO) */}
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-gray-800"></span> {currentUser?.role === 'admin' ? 'Desglose por Vendedor' : 'Detalle de mis Ventas'}
                </h2>

                <div className="space-y-4">
                    {data?.salesByUser?.map((userStat) => (
                        <div key={userStat.userId} className="bg-[#1f2937] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
                            
                            {/* Fila del Usuario */}
                            <div 
                                onClick={() => setExpandedUser(expandedUser === userStat.userId ? null : userStat.userId)}
                                className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4 text-left w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900/40 uppercase">
                                        {userStat.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black uppercase tracking-tight">{userStat.userName}</h4>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                                            {userStat.userId === currentUser?.id ? 'Tú (Logueado)' : 'Asesor Comercial'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-8 items-center text-center">
                                    <div className="hidden sm:block">
                                        <p className="text-[9px] text-gray-500 uppercase font-black">Total</p>
                                        <p className="text-lg font-black text-green-400">${parseFloat(userStat.totalVendido).toLocaleString()}</p>
                                    </div>
                                    <div className={`transition-transform duration-300 ${expandedUser === userStat.userId ? 'rotate-180' : ''}`}>
                                        ▼
                                    </div>
                                </div>
                            </div>

                            {/* Detalle de Ventas */}
                            {expandedUser === userStat.userId && (
                                <div className="bg-[#0e1624]/50 border-t border-gray-800 animate-fadeIn overflow-x-auto">
                                    <table className="w-full text-left text-xs min-w-[600px]">
                                        <thead>
                                            <tr className="text-gray-500 font-black uppercase text-[9px] tracking-tighter bg-gray-900/50">
                                                <th className="p-4 text-center">Fecha</th>
                                                <th className="p-4">Cliente</th>
                                                <th className="p-4">Unidad / Concepto</th>
                                                <th className="p-4">Estado Pago</th>
                                                <th className="p-4 text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {data.salesDetails
                                                .filter(s => s.userId === userStat.userId)
                                                .map(sale => (
                                                    <tr key={sale.id} className="hover:bg-blue-600/5 transition-colors">
                                                        <td className="p-4 font-mono opacity-60 text-center">
                                                            {format(new Date(sale.fechaOperacion), 'dd/MM/yy')}
                                                        </td>
                                                        <td className="p-4 font-bold uppercase text-gray-200">{sale.clientName}</td>
                                                        <td className="p-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-blue-300 font-black uppercase text-[9px]">{sale.unitBusiness}</span>
                                                                <span className="text-gray-400">{sale.concepto}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full text-[9px] font-bold border border-blue-500/20 uppercase">
                                                                {sale.estadoPago || 'Pendiente'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right font-black text-white">
                                                            ${parseFloat(sale.total).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {data?.salesByUser?.length === 0 && (
                    <div className="p-20 text-center text-gray-600 italic border-2 border-dashed border-gray-800 rounded-3xl uppercase text-xs tracking-widest">
                        Sin actividad registrada en este periodo
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesDashboard;