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
        if (!rawFile) return toast.warning("Selecciona un archivo");

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            
            // Usamos defval para que las celdas vacías no desaparezcan del JSON
            const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

            // 1. Identificar la fila de encabezados por palabras clave
            const headerRowIndex = data.findIndex(row => 
                row.includes("Fecha") && row.includes("Saldo pendiente")
            );

            if (headerRowIndex === -1) {
                return toast.error("Estructura de Microsip no detectada. Verifica las columnas.");
            }

            const headers = data[headerRowIndex];
            const rows = data.slice(headerRowIndex + 1);

            let currentClient = "";
            let currentVendedor = "";
            const extractedResults = [];

            // 2. Lógica de Escaneo Vertical (Herencia de datos)
            rows.forEach((row) => {
                const rowObj = {};
                headers.forEach((h, i) => { if(h) rowObj[h] = row[i]; });

                const colNombre = rowObj["Nombre del cliente"]?.toString().trim();
                const colVendedor = rowObj["Nombre del vendedor"]?.toString().trim();
                const colFolio = rowObj["Folio"]?.toString().trim();
                const saldo = parseFloat(rowObj["Saldo pendiente"]);

                // Caso A: Fila de identificación de Cliente
                if (colNombre && !colFolio && !colNombre.toLowerCase().includes("total")) {
                    currentClient = colNombre;
                }
                
                // Caso B: Fila de identificación de Vendedor (a veces viene sola abajo del cliente)
                if (colVendedor && !colFolio) {
                    currentVendedor = colVendedor;
                }

                // Caso C: Fila de Factura (Data real)
                if (colFolio && !isNaN(saldo) && saldo > 0) {
                    const vencRaw = rowObj["Fecha de vencimiento"];
                    let fechaVenc;
                    
                    if (typeof vencRaw === 'number') {
                        // Corrección de fecha serial de Excel
                        fechaVenc = new Date((vencRaw - 25569) * 86400 * 1000);
                    } else {
                        fechaVenc = new Date(vencRaw);
                    }

                    const atraso = differenceInDays(today, fechaVenc);

                    extractedResults.push({
                        cliente: currentClient || "Desconocido",
                        vendedor: currentVendedor || "Sin Asignar",
                        folio: colFolio,
                        saldo: saldo,
                        vencimiento: fechaVenc,
                        diasAtraso: atraso > 0 ? atraso : 0
                    });
                }
            });

            if (extractedResults.length === 0) {
                toast.error("No se encontraron saldos pendientes procesables.");
            } else {
                setPreviewData(extractedResults);
                toast.success(`${extractedResults.length} documentos listos para análisis.`);
            }
        };
        reader.readAsBinaryString(rawFile);
    };

    const stats = useMemo(() => {
        const total = previewData.reduce((acc, curr) => acc + curr.saldo, 0);
        const criticos = previewData.filter(i => i.diasAtraso > 30).length;
        return { total, criticos };
    }, [previewData]);

    const saveToDB = async () => {
        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/microsip/bulk-upload', { sales: previewData }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Cartera actualizada correctamente.");
            setPreviewData([]);
            setFileName("");
        } catch (err) {
            toast.error("Error de conexión con el servidor.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <ToastContainer theme="dark" position="bottom-right" />
            
            <div className="max-w-7xl mx-auto">
                {/* Header Estilo CRM Grupo MR */}
                <div className="mb-12 border-l-4 border-blue-600 pl-6">
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">
                        Monitor de <span className="text-blue-500">Cobranza</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em] mt-2">
                        Sincronización Semanal de Cuentas por Cobrar
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    
                    {/* ACCIONES LATERALES */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                            
                            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-700 rounded-[2rem] bg-[#0e1624] hover:border-blue-500 transition-all cursor-pointer mb-6">
                                <FiUploadCloud className="text-4xl text-gray-600 mb-2" />
                                <span className="text-[10px] font-black uppercase text-gray-500 text-center px-6">
                                    {fileName ? fileName : "Soltar Auxiliar de Microsip"}
                                </span>
                                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </label>

                            {!previewData.length ? (
                                <button onClick={processExcel} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">
                                    <FiPlay className="inline mr-2 mb-1" /> Procesar Reporte
                                </button>
                            ) : (
                                <button onClick={saveToDB} disabled={isUploading} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all">
                                    {isUploading ? "Sincronizando..." : <><FiCheck className="inline mr-2" /> Subir al CRM</>}
                                </button>
                            )}
                        </div>

                        {previewData.length > 0 && (
                            <div className="space-y-4 animate-in slide-in-from-left duration-500">
                                <div className="bg-[#1f2937] p-6 rounded-3xl border-l-4 border-green-500">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Monto en Calle</p>
                                    <p className="text-3xl font-black text-white">${stats.total.toLocaleString('es-MX')}</p>
                                </div>
                                <div className="bg-[#1f2937] p-6 rounded-3xl border-l-4 border-red-500">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Cuentas Críticas</p>
                                    <p className="text-3xl font-black text-white">{stats.criticos}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* TABLA DE RESULTADOS */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#1f2937] rounded-[3rem] border border-gray-700 p-8 shadow-2xl flex flex-col min-h-[600px]">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    Análisis de Cartera Vencida
                                </h2>
                                {previewData.length > 0 && <span className="text-[10px] font-black text-gray-600 uppercase bg-gray-800 px-4 py-1 rounded-full">{previewData.length} Documentos</span>}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {previewData.length > 0 ? (
                                    <table className="w-full text-left text-[11px] border-separate border-spacing-y-3">
                                        <thead className="sticky top-0 bg-[#1f2937] z-10 text-[9px] text-gray-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="pb-4 pl-4">Información del Cliente</th>
                                                <th className="pb-4 text-right">Saldo</th>
                                                <th className="pb-4 text-right pr-6">Días de Atraso</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.sort((a,b) => b.diasAtraso - a.diasAtraso).map((row, idx) => (
                                                <tr key={idx} className="bg-[#0e1624] hover:bg-blue-900/10 transition-all group">
                                                    <td className="p-5 rounded-l-[1.5rem] border-y border-l border-gray-800">
                                                        <div className="font-black text-white uppercase text-sm group-hover:text-blue-400 transition-colors">{row.cliente}</div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Folio: <span className="text-blue-500">{row.folio}</span></span>
                                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Asesor: {row.vendedor}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 border-y border-gray-800 text-right font-black text-green-400 text-base">
                                                        ${row.saldo.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                                    </td>
                                                    <td className="p-5 rounded-r-[1.5rem] border-y border-r border-gray-800 text-right pr-6">
                                                        {row.diasAtraso > 0 ? (
                                                            <div className="inline-flex flex-col items-end">
                                                                <span className={`px-4 py-1 rounded-lg font-black text-[10px] shadow-lg ${
                                                                    row.diasAtraso > 45 ? 'bg-red-600 text-white shadow-red-900/20' : 'bg-yellow-500 text-black shadow-yellow-900/20'
                                                                }`}>
                                                                    {row.diasAtraso} DÍAS
                                                                </span>
                                                                <span className="text-[8px] text-gray-600 mt-1 font-bold uppercase italic">Vencimiento: {row.vencimiento.toLocaleDateString()}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-green-500/40 uppercase tracking-[0.2em] border border-green-500/10 px-3 py-1 rounded-md italic">Al Corriente</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-48">
                                        <FiClock size={120} />
                                        <p className="mt-6 font-black uppercase tracking-[0.8em] text-center text-xl">Sin Datos</p>
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