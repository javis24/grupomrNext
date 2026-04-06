import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { 
    FiUploadCloud, FiCheck, FiPlay, FiTable, 
    FiClock, FiUser, FiAlertCircle, FiTrendingUp 
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import { differenceInDays } from 'date-fns';

export default function MicrosipUpload() {
    const [previewData, setPreviewData] = useState([]);
    const [fileName, setFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [rawFile, setRawFile] = useState(null);

    const today = new Date();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        setRawFile(file);
        setPreviewData([]);
    };

    const processExcel = () => {
        if (!rawFile) return toast.warning("Selecciona un archivo primero");

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            
            // Leemos el Excel como una matriz de celdas (header: 1)
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            let currentVendedor = "Sin Asesor";
            let currentCliente = "Sin Cliente";
            const extractedSales = [];

            // Recorremos fila por fila
            data.forEach((row) => {
                if (!row || row.length === 0) return;

                const firstCell = String(row[0] || "").trim();
                const secondCell = String(row[1] || "").trim();

                // 1. Detectar cambio de VENDEDOR (Normalmente dice "Asesor comercial: ...")
                if (firstCell.toLowerCase().includes("vendedor") || firstCell.toLowerCase().includes("asesor")) {
                    currentVendedor = firstCell.split(':').pop()?.trim() || firstCell;
                    return;
                }

                // 2. Detectar cambio de CLIENTE 
                // Si la primera celda tiene texto largo y la fila no parece ser una factura (no tiene folio en col 2)
                if (firstCell && !secondCell && firstCell.length > 5 && !firstCell.includes("Reporte") && !firstCell.includes("Página")) {
                    currentCliente = firstCell;
                    return;
                }

                // 3. Detectar FACTURA (Fila con datos numéricos y fechas)
                // Col 0: Fecha, Col 1: Folio, Col 6: Saldo Pendiente (ajustar índice según Microsip)
                const isDate = !isNaN(Date.parse(row[0]));
                const hasFolio = row[1] !== undefined && row[1] !== "";
                const saldoPendiente = parseFloat(row[7] || row[6] || 0); // Ajuste según tu columna de saldo

                if (isDate && hasFolio && saldoPendiente > 0) {
                    const vencimientoRaw = row[3] || row[2]; // Ajustar índice de Fecha de Vencimiento
                    let fechaVenc;
                    
                    if (typeof vencimientoRaw === 'number') {
                        fechaVenc = new Date((vencimientoRaw - 25569) * 86400 * 1000);
                    } else {
                        fechaVenc = new Date(vencimientoRaw);
                    }

                    const atraso = differenceInDays(today, fechaVenc);

                    extractedSales.push({
                        cliente: currentCliente,
                        vendedor: currentVendedor,
                        folio: String(row[1]),
                        fechaFactura: row[0],
                        vencimiento: fechaVenc,
                        saldo: saldoPendiente,
                        diasAtraso: atraso > 0 ? atraso : 0
                    });
                }
            });

            if (extractedSales.length === 0) {
                toast.error("No se encontraron facturas pendientes. Revisa el formato.");
            } else {
                setPreviewData(extractedSales);
                toast.success(`${extractedSales.length} movimientos vinculados.`);
            }
        };
        reader.readAsBinaryString(rawFile);
    };

    const stats = useMemo(() => {
        const total = previewData.reduce((acc, curr) => acc + curr.saldo, 0);
        const vencidos = previewData.filter(i => i.diasAtraso > 0).length;
        return { total, vencidos };
    }, [previewData]);

    const saveToDB = async () => {
        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/microsip/cobranza-upload', { data: previewData }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("¡Cobranza del lunes sincronizada!");
            setPreviewData([]);
            setFileName("");
        } catch (err) {
            toast.error("Error al guardar en el servidor.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <ToastContainer theme="dark" position="bottom-right" />
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase italic text-blue-500 tracking-tighter">Cobranza Semanal</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Carga de Cartera Microsip (Atrasos)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* ACCIONES */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1f2937] p-6 rounded-[2.5rem] border border-gray-700 shadow-2xl">
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 rounded-3xl bg-[#0e1624] hover:border-blue-500 transition-all cursor-pointer group mb-4">
                                <FiUploadCloud className="text-3xl text-gray-600 group-hover:text-blue-500 mb-2" />
                                <span className="text-[10px] font-black uppercase text-gray-500 px-4 text-center">Subir Auxiliar de Cuentas</span>
                                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </label>

                            {rawFile && previewData.length === 0 && (
                                <button onClick={processExcel} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
                                    <FiPlay /> Procesar Bloques
                                </button>
                            )}

                            {previewData.length > 0 && (
                                <button onClick={saveToDB} disabled={isUploading} className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                                    {isUploading ? "Cargando..." : <><FiCheck /> Guardar en CRM</>}
                                </button>
                            )}
                        </div>

                        {previewData.length > 0 && (
                            <div className="space-y-4 animate-in fade-in zoom-in">
                                <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-3xl">
                                    <p className="text-[9px] font-black text-green-500 uppercase mb-1">Monto en Cartera</p>
                                    <p className="text-2xl font-black">${stats.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl">
                                    <p className="text-[9px] font-black text-red-400 uppercase mb-1">Cuentas con Atraso</p>
                                    <p className="text-2xl font-black">{stats.vencidos}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* TABLA RESULTADOS */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#1f2937] rounded-[2.5rem] border border-gray-700 p-6 shadow-2xl h-full flex flex-col min-h-[500px]">
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2 px-2">
                                <FiTable className="text-blue-500" /> Detalle de Cobros por Atraso
                            </h2>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {previewData.length > 0 ? (
                                    <table className="w-full text-left text-[11px] border-separate border-spacing-y-3">
                                        <thead className="sticky top-0 bg-[#1f2937] text-[9px] text-gray-500 uppercase z-10">
                                            <tr>
                                                <th className="pb-2 pl-4">Cliente / Asesor</th>
                                                <th className="pb-2">Folio</th>
                                                <th className="pb-2 text-right">Saldo</th>
                                                <th className="pb-2 text-right pr-4">Atraso</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.sort((a,b) => b.diasAtraso - a.diasAtraso).map((row, idx) => (
                                                <tr key={idx} className="bg-[#0e1624] hover:bg-blue-900/10 transition-all">
                                                    <td className="p-4 rounded-l-2xl border-y border-l border-gray-800">
                                                        <div className="font-black text-white uppercase truncate max-w-[250px]">{row.cliente}</div>
                                                        <div className="text-[9px] text-blue-400 font-bold uppercase italic mt-1">{row.vendedor}</div>
                                                    </td>
                                                    <td className="p-4 border-y border-gray-800 font-mono text-gray-400">{row.folio}</td>
                                                    <td className="p-4 border-y border-gray-800 text-right font-black text-green-400 text-sm">
                                                        ${row.saldo.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                                    </td>
                                                    <td className="p-4 rounded-r-2xl border-y border-r border-gray-800 text-right pr-4">
                                                        <span className={`px-3 py-1 rounded-lg font-black text-[10px] ${row.diasAtraso > 0 ? 'bg-red-500 text-white' : 'bg-green-500/20 text-green-500'}`}>
                                                            {row.diasAtraso > 0 ? `${row.diasAtraso} DÍAS` : 'AL DÍA'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-40">
                                        <FiClock size={100} />
                                        <p className="mt-4 font-black uppercase tracking-[0.5em] text-center">Esperando procesamiento de cartera</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}