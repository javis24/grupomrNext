import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    FiPlus,
    FiTrash2,
    FiDollarSign,
    FiUsers,
    FiClock,
    FiX,
    FiEdit2,
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import { differenceInDays, parseISO, format } from 'date-fns';

export default function CobranzaTable() {
    const [clients, setClients] = useState([]);
    const [cobranzaList, setCobranzaList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    const [formData, setFormData] = useState({
        clienteId: '',
        folio: '',
        fechaFactura: format(new Date(), 'yyyy-MM-dd'),
        fechaVencimiento: '',
        saldo: '',
    });

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
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const token = localStorage.getItem('token');

            const [resC, resCob] = await Promise.all([
                axios.get('/api/clients', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('/api/cobranza', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            setClients(resC.data);
            setCobranzaList(resCob.data);
        } catch (e) {
            toast.error('Error al sincronizar datos con el servidor');
        }
    };

    const handleEditClick = (item) => {
        setFormData({
            clienteId: item.clienteId,
            folio: item.folio,
            fechaFactura: item.fechaFactura,
            fechaVencimiento: item.fechaVencimiento,
            saldo: item.saldo,
        });

        setIsEditing(item.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const clienteSelected = clients.find(
                (c) => c.id === parseInt(formData.clienteId)
            );

            const atraso = differenceInDays(
                new Date(),
                parseISO(formData.fechaVencimiento)
            );

            const payload = {
                clienteId: parseInt(formData.clienteId),
                clienteNombre: clienteSelected.companyName || clienteSelected.fullName,
                folio: formData.folio,
                fechaFactura: formData.fechaFactura,
                fechaVencimiento: formData.fechaVencimiento,
                saldo: parseFloat(formData.saldo),
                diasAtraso: atraso > 0 ? atraso : 0,
            };

            if (isEditing) {
                await axios.put(`/api/cobranza?id=${isEditing}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Registro actualizado');
            } else {
                await axios.post('/api/cobranza', payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Factura guardada');
            }

            setShowForm(false);
            setIsEditing(null);
            setFormData({
                clienteId: '',
                folio: '',
                fechaFactura: format(new Date(), 'yyyy-MM-dd'),
                fechaVencimiento: '',
                saldo: '',
            });

            await loadInitialData();
        } catch (e) {
            toast.error('Error al procesar la solicitud');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Deseas eliminar este registro de cobranza?')) return;

        try {
            const token = localStorage.getItem('token');

            await axios.delete(`/api/cobranza?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            loadInitialData();
            toast.info('Registro eliminado');
        } catch (e) {
            toast.error('Error al eliminar');
        }
    };

    const totalSaldo = useMemo(
        () => cobranzaList.reduce((acc, curr) => acc + Number(curr.saldo), 0),
        [cobranzaList]
    );

    const totalClientesCount = useMemo(
        () => [...new Set(cobranzaList.map((c) => c.clienteId))].length,
        [cobranzaList]
    );

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
                            Gestión Manual de Cartera Vencida
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`${
                            showForm
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                        } px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg`}
                    >
                        {showForm ? (
                            <>
                                <FiX size={18} /> Cancelar
                            </>
                        ) : (
                            <>
                                <FiPlus size={18} /> Nuevo Cargo
                            </>
                        )}
                    </button>
                </div>

                {/* TARJETAS DE RESUMEN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white dark:bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-2xl relative overflow-hidden group transition-colors">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500 opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                        <div>
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                                Cartera Total
                            </p>

                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                $
                                {totalSaldo.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                })}
                            </p>
                        </div>

                        <FiDollarSign size={45} className="text-blue-500 opacity-20" />
                    </div>

                    <div className="bg-white dark:bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-xl relative overflow-hidden group transition-colors">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500 opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                        <div>
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                                Clientes Pendientes
                            </p>

                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                {totalClientesCount}
                            </p>
                        </div>

                        <FiUsers size={45} className="text-blue-500 opacity-20" />
                    </div>
                </div>

                {/* FORMULARIO DESPLEGABLE */}
                {showForm && (
                    <div className="bg-white dark:bg-[#1f2937] p-8 rounded-[2.5rem] border border-blue-200 dark:border-blue-500/30 mb-12 shadow-2xl animate-in fade-in slide-in-from-top-4 transition-colors">
                        <h2 className="text-xs font-black uppercase text-gray-900 dark:text-white mb-6 flex items-center gap-2 italic">
                            <div className="w-1.5 h-4 bg-blue-500"></div>
                            {isEditing ? 'Editar cargo manual' : 'Registrar nuevo cargo manual'}
                        </h2>

                        <form
                            onSubmit={handleSave}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end"
                        >
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase ml-2">
                                    Seleccionar Cliente
                                </label>

                                <select
                                    className="bg-gray-50 dark:bg-[#0e1624] border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    value={formData.clienteId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, clienteId: e.target.value })
                                    }
                                    required
                                >
                                    <option value="">Elegir cliente...</option>

                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.companyName || c.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase ml-2">
                                    Folio / Referencia
                                </label>

                                <input
                                    type="text"
                                    className="bg-gray-50 dark:bg-[#0e1624] border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    value={formData.folio}
                                    onChange={(e) =>
                                        setFormData({ ...formData, folio: e.target.value })
                                    }
                                    placeholder="Ej. F-123"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase ml-2">
                                    Vencimiento
                                </label>

                                <input
                                    type="date"
                                    className="bg-gray-50 dark:bg-[#0e1624] border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    value={formData.fechaVencimiento}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            fechaVencimiento: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase ml-2">
                                    Saldo Pendiente
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    className="bg-gray-50 dark:bg-[#0e1624] border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-900 dark:text-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                                    value={formData.saldo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, saldo: e.target.value })
                                    }
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-500 text-white h-[42px] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-900/20"
                            >
                                {isLoading ? '...' : isEditing ? 'Actualizar' : 'Guardar'}
                            </button>
                        </form>
                    </div>
                )}

                {/* TABLA PRINCIPAL */}
                <div className="bg-white dark:bg-[#1f2937] rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] border-separate border-spacing-0">
                            <thead className="bg-gray-100 dark:bg-[#111827] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="p-6">Nombre del Cliente / Folio</th>
                                    <th className="p-6 text-center">Fecha Vencimiento</th>
                                    <th className="p-6 text-right">Días Atraso</th>
                                    <th className="p-6 text-right">Saldo Pendiente</th>
                                    <th className="p-6 text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {cobranzaList.length > 0 ? (
                                    cobranzaList
                                        .sort((a, b) => b.diasAtraso - a.diasAtraso)
                                        .map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                            >
                                                <td className="p-6">
                                                    <div className="font-black text-gray-900 dark:text-white uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                                                        {item.clienteNombre}
                                                    </div>

                                                    <div className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase mt-1 tracking-tighter italic">
                                                        Ref: {item.folio}
                                                    </div>
                                                </td>

                                                <td className="p-6 text-center text-gray-500 dark:text-gray-400 font-mono">
                                                    {format(
                                                        parseISO(item.fechaVencimiento),
                                                        'dd/MM/yyyy'
                                                    )}
                                                </td>

                                                <td className="p-6 text-right">
                                                    <span
                                                        className={`px-4 py-1.5 rounded-lg font-black text-[10px] shadow-lg ${
                                                            item.diasAtraso > 0
                                                                ? 'bg-red-600 text-white'
                                                                : 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-500'
                                                        }`}
                                                    >
                                                        {item.diasAtraso > 0
                                                            ? `${item.diasAtraso} DÍAS`
                                                            : 'AL DÍA'}
                                                    </span>
                                                </td>

                                                <td className="p-6 text-right font-black text-green-600 dark:text-green-400 text-base">
                                                    $
                                                    {Number(item.saldo).toLocaleString('es-MX', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </td>

                                                <td className="p-6 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleEditClick(item)}
                                                            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-all p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl"
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-all p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
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
                                                Sin registros de cobranza
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