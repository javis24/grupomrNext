import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { 
    FiUploadCloud, FiCheck, FiPlay, FiTable, 
    FiClock, FiAlertCircle, FiTrendingUp
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
            
            //header: 1 nos da un array de arrays (filas y columnas)
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

            let currentClient = "";
            let currentVendedor = "Sin Asignar";
            const results = [];

            rows.forEach((row) => {
                // Según tu imagen:
                // row[0] -> Col A (Vacia en facturas, tiene nombre en cabecera)
                // row[1] -> Col B (Fecha Factura)
                // row[2] -> Col C (Folio)
                // row[3] -> Col D (Fecha Vencimiento)
                // row[9] -> Col J (Saldo Pendiente)

                const cellA = row[0] ? row[0].toString().trim() : "";
                const cellB = row[1] ? row[1].toString().trim() : "";
                const cellC = row[2] ? row[2].toString().trim() : "";
                const saldoRaw = row[9]; // Columna J

                // 1. DETECTAR NOMBRE DEL CLIENTE (Fila donde Col A tiene texto y Col C está vacía)
                if (cellA !== "" && cellC === "") {
                    // Evitar basura de encabezados de Microsip
                    if (!cellA.includes("Auxiliar") && !cellA.includes("Fecha") && !cellA.includes("Página")) {
                        currentClient = cellA;
                    }
                }

                // 2. DETECTAR VENDEDOR (Suele venir en una fila que dice "Vendedor: ...")
                const rowText = row.join(" ");
                if (rowText.includes("Vendedor:")) {
                    currentVendedor = rowText.split("Vendedor:")[1].trim();
                }

                // 3. DETECTAR FACTURA (Fila donde Col C tiene el Folio y Col J tiene Saldo)
                const saldo = parseFloat(saldoRaw);
                if (cellC !== "" && !isNaN(saldo) && saldo > 0) {
                    // Ignorar la fila de encabezados de la tabla
                    if (cellC === "Folio" || cellC === "Referencia") return;

                    const vencRaw = row[3]; // Columna D
                    let fechaVenc;

                    if (typeof vencRaw === 'number') {
                        // Fecha serial de Excel
                        fechaVenc = new Date((vencRaw - 25569) * 86400 * 1000);
                    } else {
                        fechaVenc = new Date(vencRaw);
                    }

                    if (!isNaN(fechaVenc.getTime())) {
                        const atraso = differenceInDays(today, fechaVenc);
                        results.push({
                            cliente: currentClient,
                            vendedor: currentVendedor,
                            folio: cellC,
                            saldo: saldo,
                            vencimiento: fechaVenc,
                            diasAtraso: atraso > 0 ? atraso : 0
                        });
                    }
                }
            });

            if (results.length === 0) {
                toast.error("No se encontraron facturas pendientes. Verifica el formato del reporte.");
            } else {
                setPreviewData(results);
                toast.success(`${results.length} facturas extraídas.`);
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
            await axios.post('/api/microsip/bulk-upload', { sales: previewData }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Cartera de Cobranza actualizada en el CRM");
            setPreviewData([]);
            setFileName("");
        } catch (err) {
            toast.error("Error al guardar registros.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-[#0e1624] min-h-screen text-white font-sans">
            <ToastContainer theme="dark" position="bottom-right" />
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-8">
                    <div>
                        <h1 className="text-5xl font-black uppercase italic text-blue-500 tracking-tighter">Cobranza GMR</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em] mt-2">Sincronización Semanal Microsip</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700 shadow-2xl">
                            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-700 rounded-3xl bg-[#0e1624] hover:border-blue-500 transition-all cursor-pointer group mb-6">
                                <FiUploadCloud className="text-4xl text-gray-600 group-hover:text-blue-500 mb-2 transition-colors" />
                                <span className="text-[10px] font-black uppercase text-gray-500 px-4 text-center">
                                    {fileName ? fileName : "Cargar Auxiliar de Cobranza"}
                                </span>
                                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </label>

                            {rawFile && !previewData.length && (
                                <button onClick={processExcel} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">
                                    <FiPlay className="inline mr-2" /> Analizar Cartera
                                </button>
                            )}

                            {previewData.length > 0 && (
                                <button onClick={saveToDB} disabled={isUploading} className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all">
                                    <FiCheck className="inline mr-2" /> Subir al CRM
                                </button>
                            )}
                        </div>

                        {previewData.length > 0 && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem]">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Monto Total</p>
                                    <p className="text-3xl font-black text-white">${stats.total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                                </div>
                                <div className="bg-red-600/10 border border-red-500/20 p-6 rounded-[2rem]">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Facturas Vencidas</p>
                                    <p className="text-3xl font-black text-white">{stats.vencidos}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-[#1f2937] rounded-[2.5rem] border border-gray-700 p-8 shadow-2xl h-full min-h-[600px] flex flex-col">
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                Monitor de Cartera Vencida
                            </h2>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {previewData.length > 0 ? (
                                    <table className="w-full text-left text-[11px] border-separate border-spacing-y-3">
                                        <thead className="sticky top-0 bg-[#1f2937] text-[9px] text-gray-600 uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="pb-4 pl-4">Cliente / Folio</th>
                                                <th className="pb-4 text-right">Saldo</th>
                                                <th className="pb-4 text-right pr-6">Días de Atraso</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.sort((a,b) => b.diasAtraso - a.diasAtraso).map((row, idx) => (
                                                <tr key={idx} className="bg-[#0e1624] hover:bg-blue-900/10 transition-all group">
                                                    <td className="p-5 rounded-l-2xl border-y border-l border-gray-800">
                                                        <div className="font-black text-white uppercase text-sm group-hover:text-blue-400 transition-colors">{row.cliente}</div>
                                                        <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase">
                                                            Folio: <span className="text-blue-500">{row.folio}</span> | Asesor: {row.vendedor}
                                                        </div>
                                                    </td>
                                                    <td className="p-5 border-y border-gray-800 text-right font-black text-green-400 text-base">
                                                        ${row.saldo.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                                    </td>
                                                    <td className="p-5 rounded-r-2xl border-y border-r border-gray-800 text-right pr-6">
                                                        {row.diasAtraso > 0 ? (
                                                            <div className="flex flex-col items-end">
                                                                <span className={`px-4 py-1 rounded-lg font-black text-[10px] ${
                                                                    row.diasAtraso > 30 ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'
                                                                }`}>
                                                                    {row.diasAtraso} DÍAS
                                                                </span>
                                                                <span className="text-[8px] text-gray-600 mt-1 uppercase font-bold italic">Vence: {row.vencimiento.toLocaleDateString()}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-green-500/40 uppercase tracking-widest">Al corriente</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-48">
                                        <FiClock size={120} />
                                        <p className="mt-6 font-black uppercase tracking-[1em]">Esperando Datos</p>
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