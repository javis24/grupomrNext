import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalesDashboard = () => {
    const [data, setData] = useState(null);
    const [range, setRange] = useState('month'); // day, week, month

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/reports/performance?range=${range}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        };
        fetchStats();
    }, [range]);

    return (
        <div className="p-6 bg-[#0e1624] text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold italic">REPORTE DE RENDIMIENTO POR ASESOR</h2>
                <select 
                    value={range} 
                    onChange={(e) => setRange(e.target.value)}
                    className="bg-[#1f2937] p-2 rounded border border-gray-700 outline-none"
                >
                    <option value="day">Hoy</option>
                    <option value="week">Última Semana</option>
                    <option value="month">Último Mes</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta de Ventas Totales */}
                <div className="bg-[#1f2937] p-6 rounded-xl border-l-4 border-green-500 shadow-lg">
                    <p className="text-gray-400 text-sm">Ventas Totales (USD)</p>
                    <h3 className="text-3xl font-black mt-2">
                        ${data?.sales.reduce((acc, curr) => acc + parseFloat(curr.totalVendido), 0).toLocaleString() || '0'}
                    </h3>
                </div>

                {/* Tarjeta de Clientes Nuevos */}
                <div className="bg-[#1f2937] p-6 rounded-xl border-l-4 border-blue-500 shadow-lg">
                    <p className="text-gray-400 text-sm">Clientes Registrados</p>
                    <h3 className="text-3xl font-black mt-2">
                        {data?.clients.reduce((acc, curr) => acc + curr.clientesRegistrados, 0) || '0'}
                    </h3>
                </div>
                
                {/* Tarjeta de Eficiencia (Conversión) */}
                <div className="bg-[#1f2937] p-6 rounded-xl border-l-4 border-yellow-500 shadow-lg">
                    <p className="text-gray-400 text-sm">Ventas promedio por cliente</p>
                    <h3 className="text-3xl font-black mt-2">
                        {data?.sales.length > 0 ? (data.sales[0].totalVendido / data.sales[0].cantidadVentas).toFixed(2) : '0'}
                    </h3>
                </div>
            </div>

            {/* Tabla Detallada por Vendedor */}
            <div className="mt-8 bg-[#1f2937] rounded-xl overflow-hidden border border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Vendedor</th>
                            <th className="p-4">Ventas ($)</th>
                            <th className="p-4">Clientes Nuevos</th>
                        </tr>
                    </thead>
                    <tbody>
                       {data?.sales.map((s, i) => (
                            <tr key={i} className="border-t border-gray-700">
                                {/* Verifica si es s.user o s.User dependiendo de tu asociación */}
                                <td className="p-4 font-bold text-blue-400">{s.user?.name || s.User?.name || 'Asesor'}</td>
                                <td className="p-4">${parseFloat(s.totalVendido).toLocaleString()}</td>
                                <td className="p-4">
                                    {data.clients.find(c => c.userId === s.userId)?.clientesRegistrados || 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesDashboard;