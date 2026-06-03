import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    FiDollarSign,
    FiUsers,
    FiClock,
    FiSearch,
    FiRefreshCw,
    FiDownload,
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';


export default function CobranzaTable() {
    const [sales, setSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);

        const observer = new MutationObserver(() => {
            setDarkMode(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        try {
            setIsLoading(true);

            const token = localStorage.getItem('token');

            const res = await axios.get('/api/salesbussines', {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSales(res.data || []);
        } catch (error) {
            console.error('Error cargando ventas para cobranza:', error);
            toast.error('Error al cargar información de ventas');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return 'Sin fecha';

        const cleanDate = String(dateValue).split('T')[0];
        const date = new Date(`${cleanDate}T00:00:00`);

        return date.toLocaleDateString('es-MX');
    };

    const calcularFechaEstimada = (fechaBase, plazoCredito) => {
        if (!fechaBase || !plazoCredito) return null;

        const cleanDate = String(fechaBase).split('T')[0];
        const date = new Date(`${cleanDate}T00:00:00`);

        date.setDate(date.getDate() + Number(plazoCredito));

        return date.toISOString().split('T')[0];
    };

    const calcularDiasMasOMenos = (fechaEstimada) => {
        if (!fechaEstimada) return null;

        const fecha = new Date(`${String(fechaEstimada).split('T')[0]}T00:00:00`);
        const hoy = new Date();

        fecha.setHours(0, 0, 0, 0);
        hoy.setHours(0, 0, 0, 0);

        const diffMs = fecha - hoy;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    };

    const getClienteNombre = (sale) => {
        return (
            sale.client?.companyName ||
            sale.client?.fullName ||
            sale.Client?.companyName ||
            sale.Client?.fullName ||
            sale.clients?.companyName ||
            sale.clients?.fullName ||
            sale.clienteNombre ||
            'Cliente no identificado'
        );
    };

    const getTotal = (sale) => {
        return Number(sale.cantidad || 0) * Number(sale.precioUnitario || 0);
    };

    const cobranzaRows = useMemo(() => {
        return sales.map((sale) => {
            const fechaBase = sale.fechaCotizacion || sale.fechaOperacion;
            const fechaEstimada =
                sale.fechaEstimadaPago ||
                calcularFechaEstimada(fechaBase, sale.plazoCredito);

            const diasMasOMenos = calcularDiasMasOMenos(fechaEstimada);

            return {
                id: sale.id,
                fechaFactura: sale.fechaCotizacion || sale.fechaOperacion,
                cliente: getClienteNombre(sale),
                plazoCredito: sale.plazoCredito,
                factura: sale.numeroFactura,
                planta: sale.unitBusiness,
                descripcion: sale.concepto,
                total: getTotal(sale),
                estadoPago: sale.estadoPago,
                fechaEstimada,
                diasMasOMenos,
                requiereFactura: sale.requiereFactura,
                noRemision: sale.noRemision,
            };
        });
    }, [sales]);

    const filteredRows = useMemo(() => {
        const search = searchTerm.toLowerCase();

        return cobranzaRows.filter((row) => {
            return (
                row.cliente?.toLowerCase().includes(search) ||
                row.factura?.toLowerCase().includes(search) ||
                row.planta?.toLowerCase().includes(search) ||
                row.descripcion?.toLowerCase().includes(search) ||
                row.estadoPago?.toLowerCase().includes(search) ||
                row.noRemision?.toLowerCase().includes(search)
            );
        });
    }, [cobranzaRows, searchTerm]);

    const totalCartera = useMemo(() => {
        return filteredRows.reduce((acc, row) => acc + Number(row.total || 0), 0);
    }, [filteredRows]);

    const totalClientes = useMemo(() => {
        return new Set(filteredRows.map((row) => row.cliente)).size;
    }, [filteredRows]);



    const exportToExcel = () => {
    if (!filteredRows || filteredRows.length === 0) {
        toast.warning('No hay información para exportar');
        return;
    }

    const dataToExport = filteredRows.map((row) => ({
        'FECHA DE FACTURA': formatDate(row.fechaFactura),
        'CLIENTE': row.cliente,
        'PLAZO CRÉDITO': row.plazoCredito ? Number(row.plazoCredito) : 0,
        'FACTURA': row.factura || 'Sin factura',
        'PLANTA': row.planta || 'Sin planta',
        'DESCRIPCIÓN': row.descripcion || 'Sin descripción',
        'TOTAL': Number(row.total || 0),
        'ESTADO PAGO': row.estadoPago || 'Sin estado',
        'FECHA ESTIMADA': formatDate(row.fechaEstimada),
        'DÍAS MÁS O MENOS': row.diasMasOMenos === null ? 'Sin plazo' : row.diasMasOMenos,
        'NO. REMISIÓN': row.noRemision || 'Sin remisión',
        '¿SE FACTURA?': row.requiereFactura || 'Sin definir',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    worksheet['!cols'] = [
        { wch: 18 },
        { wch: 35 },
        { wch: 14 },
        { wch: 18 },
        { wch: 16 },
        { wch: 35 },
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cobranza');

    const fecha = new Date().toISOString().split('T')[0];

    XLSX.writeFile(workbook, `cobranza_ventas_${fecha}.xlsx`);
};

    return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-[#0e1624] min-h-screen text-gray-900 dark:text-white font-sans transition-colors duration-300">
            <ToastContainer theme={darkMode ? 'dark' : 'light'} position="bottom-right" />

            <div className="max-w-7xl mx-auto">

                {/* CABECERA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black uppercase italic text-blue-600 dark:text-blue-500 tracking-tighter">
                            Cobranza
                        </h1>

                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">
                            Alimentado automáticamente desde Ventas
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-80">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Buscar cliente, factura, planta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-[#1f2937] border border-gray-300 dark:border-gray-700 rounded-2xl p-4 pl-12 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <button
                            onClick={loadSales}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                            Actualizar
                        </button>
                        <button
                        onClick={exportToExcel}
                        disabled={filteredRows.length === 0}
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <FiDownload />
                        Excel
                    </button>
                    </div>
                </div>

                {/* TARJETAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white dark:bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-2xl relative overflow-hidden transition-colors">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                                Cartera Total
                            </p>

                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                $
                                {totalCartera.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                })}
                            </p>
                        </div>

                        <FiDollarSign size={45} className="text-blue-500 opacity-20" />
                    </div>

                    <div className="bg-white dark:bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-xl relative overflow-hidden transition-colors">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                                Clientes en listado
                            </p>

                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                {totalClientes}
                            </p>
                        </div>

                        <FiUsers size={45} className="text-blue-500 opacity-20" />
                    </div>
                </div>

                {/* TABLA COMPACTA */}
<div className="bg-white dark:bg-[#1f2937] rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transition-colors">
    <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] border-separate border-spacing-0 min-w-[900px]">
            <thead className="bg-gray-100 dark:bg-[#111827] text-gray-600 dark:text-gray-400 font-black uppercase tracking-widest text-[9px]">
                <tr>
                    <th className="p-4">Cliente / Planta</th>
                    <th className="p-4">Factura / Fechas</th>
                    <th className="p-4">Descripción</th>
                    <th className="p-4 text-center">Crédito</th>
                    <th className="p-4 text-right">Total</th>
                </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredRows.length > 0 ? (
                    filteredRows.map((row) => (
                        <tr
                            key={row.id}
                            className="hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                        >
                            {/* CLIENTE / PLANTA */}
                            <td className="p-4 min-w-[230px]">
                                <div className="font-black text-gray-900 dark:text-white uppercase text-sm">
                                    {row.cliente}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 font-black text-[9px] uppercase">
                                        {row.planta || 'Sin planta'}
                                    </span>

                                    <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-black text-[9px] uppercase">
                                        Rem: {row.noRemision || 'S/R'}
                                    </span>
                                </div>
                            </td>

                            {/* FACTURA / FECHAS */}
                            <td className="p-4 min-w-[190px]">
                                <div className="font-black text-yellow-700 dark:text-yellow-400 uppercase">
                                    {row.factura || 'Sin factura'}
                                </div>

                                <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 space-y-1 font-bold uppercase">
                                    <p>Factura: {formatDate(row.fechaFactura)}</p>
                                    <p>Estimada: {formatDate(row.fechaEstimada)}</p>
                                </div>
                            </td>

                            {/* DESCRIPCIÓN */}
                            <td className="p-4 min-w-[230px]">
                                <div className="font-bold text-gray-700 dark:text-gray-300 uppercase leading-snug">
                                    {row.descripcion || 'Sin descripción'}
                                </div>

                                <div className="mt-2">
                                    <span className="px-3 py-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-400 font-black text-[9px] uppercase">
                                        {row.estadoPago || 'Sin estado'}
                                    </span>
                                </div>
                            </td>

                            {/* CRÉDITO */}
                            <td className="p-4 text-center min-w-[150px]">
                                <div className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase mb-2">
                                    Plazo: {row.plazoCredito ? `${row.plazoCredito} días` : '0 días'}
                                </div>

                                {row.diasMasOMenos === null ? (
                                    <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-black text-[9px] uppercase">
                                        Sin plazo
                                    </span>
                                ) : (
                                    <span
                                        className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase ${
                                            row.diasMasOMenos < 0
                                                ? 'bg-red-600 text-white'
                                                : row.diasMasOMenos === 0
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400'
                                        }`}
                                    >
                                        {row.diasMasOMenos > 0 && `+${row.diasMasOMenos} días`}
                                        {row.diasMasOMenos === 0 && 'Vence hoy'}
                                        {row.diasMasOMenos < 0 && `${row.diasMasOMenos} días`}
                                    </span>
                                )}
                            </td>

                            {/* TOTAL */}
                            <td className="p-4 text-right min-w-[130px]">
                                <div className="font-black text-green-600 dark:text-green-400 text-lg whitespace-nowrap">
                                    $
                                    {Number(row.total || 0).toLocaleString('es-MX', {
                                        minimumFractionDigits: 2,
                                    })}
                                </div>

                                <div className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase mt-1">
                                    Total venta
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan="5"
                            className="p-20 text-center text-gray-400 dark:text-gray-500"
                        >
                            <FiClock size={80} className="mx-auto mb-4 opacity-40" />

                            <p className="font-black uppercase tracking-[0.4em]">
                                Sin ventas para mostrar en cobranza
                            </p>
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