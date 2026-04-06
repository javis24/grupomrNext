import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { 
    FiUploadCloud, FiCheck, FiPlay, FiTable, 
    FiAlertCircle, FiClock, FiUser, FiCalendar 
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
        if (!rawFile) return toast.warning("Selecciona un archivo");

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws, { header: 1 });

            // LOCALIZACIÓN DE TÍTULOS (Basado en tu nueva imagen)
            // Buscamos la fila que contiene los encabezados del auxiliar
            const headerRowIndex = json.findIndex(row => 
                row.includes("Fecha") && row.includes("Fecha de vencimiento") && row.includes("Saldo pendiente")
            );

            if (headerRowIndex === -1) {
                return toast.error("No se detectó el formato de Auxiliar de Cuentas por Cobrar.");
            }

            const cleanData = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex });

            const mapped = cleanData.map(row => {
                const vencimientoRaw = row['Fecha de vencimiento'];
                const fechaFactura = row['Fecha'];
                
                // Conversión de fecha de Excel a JS
                let fechaVenc;
                if (typeof vencimientoRaw === 'number') {
                    fechaVenc = new Date((vencimientoRaw - 25569) * 86400 * 1000);
                } else {
                    fechaVenc = new Date(vencimientoRaw);
                }

                const saldo = parseFloat(row['Saldo pendiente'] || 0);
                const atraso = differenceInDays(today, fechaVenc);

                return {
                    cliente: row['Nombre del cliente'],
                    vendedor: row['Nombre del vendedor'],
                    folio: row['Folio'],
                    fechaFactura: fechaFactura,
                    vencimiento: fechaVenc,
                    saldo: saldo,
                    diasAtraso: atraso > 0 ? atraso : 0
                };
            }).filter(item => item.cliente && item.saldo > 0 && !item.cliente.includes("Total"));

            setPreviewData(mapped);
            toast.success(`${mapped.length} saldos pendientes encontrados.`);
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
            // Usamos el endpoint de cobranza que definimos
            await axios.post('/api/microsip/cobranza-upload', { data: previewData }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Cartera de lunes actualizada correctamente.");
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
                <div className="mb-10">
                    <h1 className="text-4xl font-black uppercase italic text-blue-500 tracking-tighter">Cobranza Semanal</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Corte de Cartera Vencida (Microsip)</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* ACCIONES */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1f2937] p-6 rounded-[2.5rem] border border-gray-700 shadow-2xl">
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 rounded-3xl bg-[#0e1624] hover:border-blue-500 transition-all cursor-pointer group mb-4 text-center">
                                <FiUploadCloud className="text-3xl text-gray-600 group-hover:text-blue-500 mb-2" />
                                <span className="text-[10px] font-black uppercase text-gray-500 px-4">Subir Auxiliar de Cuentas</span>
                                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </label>

                            {rawFile && previewData.length === 0 && (
                                <button onClick={processExcel} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                                    <FiPlay className="inline mr-2" /> Analizar Atrasos
                                </button>
                            )}

                            {previewData.length > 0 && (
                                <button onClick={saveToDB} disabled={isUploading} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg">
                                    <FiCheck className="inline mr-2" /> Actualizar Sistema
                                </button>
                            )}
                        </div>

                        {previewData.length > 0 && (
                            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-3xl">
                                    <p className="text-[9px] font-black text-green-500 uppercase mb-1">Pendiente Total</p>
                                    <p className="text-2xl font-black">${stats.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl">
                                    <p className="text-[9px] font-black text-red-400 uppercase mb-1">Facturas con Atraso</p>
                                    <p className="text-2xl font-black">{stats.vencidos}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* TABLA DE RESULTADOS */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#1f2937] rounded-[2.5rem] border border-gray-700 p-6 shadow-2xl h-full flex flex-col min-h-[600px]">
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2 px-2">
                                <FiTable className="text-blue-500" /> Monitoreo de Días de Atraso
                            </h2>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {previewData.length > 0 ? (
                                    <table className="w-full text-left text-[11px] border-separate border-spacing-y-3">
                                        <thead className="sticky top-0 bg-[#1f2937] z-10 text-[9px] text-gray-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="pb-2 pl-4">Cliente / Vendedor</th>
                                                <th className="pb-2">Folio</th>
                                                <th className="pb-2 text-right">Saldo Pendiente</th>
                                                <th className="pb-2 text-right pr-4">Atraso Real</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.sort((a,b) => b.diasAtraso - a.diasAtraso).map((row, idx) => (
                                                <tr key={idx} className="bg-[#0e1624] hover:bg-blue-900/10 transition-all group">
                                                    <td className="p-4 rounded-l-2xl border-y border-l border-gray-800">
                                                        <div className="font-black text-white uppercase group-hover:text-blue-400 transition-colors leading-tight">{row.cliente}</div>
                                                        <div className="text-[9px] text-gray-500 font-bold mt-1 uppercase italic">{row.vendedor}</div>
                                                    </td>
                                                    <td className="p-4 border-y border-gray-800 font-mono text-gray-400">
                                                        {row.folio}
                                                    </td>
                                                    <td className="p-4 border-y border-gray-800 text-right font-black text-green-400 text-sm">
                                                        ${row.saldo.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                                    </td>
                                                    <td className="p-4 rounded-r-2xl border-y border-r border-gray-800 text-right pr-4">
                                                        {row.diasAtraso > 0 ? (
                                                            <div className="flex flex-col items-end">
                                                                <span className={`px-3 py-1 rounded-lg font-black text-[10px] ${
                                                                    row.diasAtraso > 30 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                                                                }`}>
                                                                    {row.diasAtraso} DÍAS
                                                                </span>
                                                                <span className="text-[8px] text-gray-600 mt-1 uppercase font-bold">Venció: {row.vencimiento.toLocaleDateString()}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-green-500/50 uppercase tracking-widest">Al corriente</span>
                                                        )}
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