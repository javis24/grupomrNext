import { useEffect, useState, useRef } from 'react'; 
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRouter } from 'next/router';
import axios from 'axios'; 
import { toast, ToastContainer } from 'react-toastify';
import { FiCheckSquare, FiSquare, FiFileText, FiPlus, FiTrash2, FiSearch, FiDownload, FiEdit3 } from 'react-icons/fi';

const CreateQuote = () => {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [quoteNumber, setQuoteNumber] = useState(1);
    const [currentDate, setCurrentDate] = useState("");

    const [allClients, setAllClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef(null);

    const [userQuotes, setUserQuotes] = useState([]);
    const [listSearchTerm, setListSearchTerm] = useState("");
    
    const [originalQuoteLoaded, setOriginalQuoteLoaded] = useState(null);
    const [descripcionGeneral, setDescripcionGeneral] = useState("");
    const [observacionesSeleccionadas, setObservacionesSeleccionadas] = useState([]);

    const opcionesObservaciones = [
        "PRECIO DURANTE EL PRESENTE AÑO", "PRECIOS MAS IVA", "PRECIOS ANTES DE IMPUESTOS",
        "INCLUYE GASTOS DE ENTREGA", "LAB NUESTRA BODEGA", "TERMINOS DE ENTREGA 4 SEMANAS",
        "TERMINOS DE ENTREGA 15 DIAS", "TERMINOS DE ENTREGA 8 DIAS",
        "TIEMPO DE RESPUESTA: CON PROGRAMAMCION DE 24 HRS.", "CONDICIONES DE PAGO: CREDITO",
        "CONDICIONES DE PAGO: CONTADO", "CONDICIONES DE PAGO: CON ANTICIPO",
        "VIGENCIA DE LA COTIZACION: 15 DIAS",
        "CONTAMOS CON LOS PERMISOS Y AUORIZACIONES NECESARIOS PARA EL DESARROLLO DE NUESTRAS ACTIVIDADES",
        "INCLUYE ELABORACION Y ENTREGA DE MANIFIESTOS. SOLICITARLO AL CONTRATAR SERVICIOS."
    ];

    const [clientData, setClientData] = useState({
        companyName: '', address: '', attentionTo: '', department: '',
        email: '', phone: '', supervisor: ''
    });

    const [serviceRows, setServiceRows] = useState([
        { description: '', cantidad: 1, um: 'SERVICIO', pu: 0, subtotal: 0, iva: 0, total: 0, comments: '' }
    ]);

    // ==========================================
    // LÓGICA DE CARGA Y EDICIÓN (CORREGIDA)
    // ==========================================
    const loadQuoteToForm = (quote) => {
        setOriginalQuoteLoaded(quote);
        
        // Mapeo exhaustivo de campos para asegurar que Domicilio y Asesor carguen
        setClientData({
            companyName: quote.companyName || '',
            address: quote.address || '', // Asegúrate que el modelo devuelva 'address'
            attentionTo: quote.attentionTo || '',
            department: quote.department || 'COMPRAS',
            email: quote.email || '',
            phone: quote.phone || '',
            supervisor: quote.supervisor || '' // Asegúrate que el modelo devuelva 'supervisor'
        });

        setServiceRows(quote.items || []);
        setDescripcionGeneral(quote.descripcionGeneral || ""); // Carga la descripción
        setObservacionesSeleccionadas(quote.observaciones || []); // Carga términos
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(`Editando Cotización #${quote.quoteNumber}`);
    };

    const hasChanges = () => {
        if (!originalQuoteLoaded) return true;
        const current = {
            c: clientData.companyName,
            a: clientData.address,
            s: clientData.supervisor,
            i: JSON.stringify(serviceRows),
            d: descripcionGeneral,
            o: JSON.stringify(observacionesSeleccionadas.sort())
        };
        const original = {
            c: originalQuoteLoaded.companyName,
            a: originalQuoteLoaded.address,
            s: originalQuoteLoaded.supervisor,
            i: JSON.stringify(originalQuoteLoaded.items),
            d: originalQuoteLoaded.descripcionGeneral,
            o: JSON.stringify((originalQuoteLoaded.observaciones || []).sort())
        };
        return JSON.stringify(current) !== JSON.stringify(original);
    };

    // ==========================================
    // CARGA INICIAL Y FETCH
    // ==========================================
    useEffect(() => {
        fetchInitialData();
        const lastQuoteNumber = localStorage.getItem('quoteNumber');
        if (lastQuoteNumber) setQuoteNumber(parseInt(lastQuoteNumber) + 1);
        setCurrentDate(new Date().toLocaleDateString('es-MX'));
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [clientsRes, quotesRes] = await Promise.all([
                axios.get('/api/clients', { headers }),
                axios.get('/api/quotes', { headers })
            ]);
            setAllClients(clientsRes.data);
            setUserQuotes(quotesRes.data);
        } catch (err) { console.error("Error al cargar datos iniciales", err); }
    };

    // Filtrado del historial
    const filteredQuotes = userQuotes
        .filter(quote => {
            const search = listSearchTerm.toLowerCase();
            return (quote.companyName || "").toLowerCase().includes(search) || 
                   quote.items?.some(item => (item.description || "").toLowerCase().includes(search));
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const displayedQuotes = listSearchTerm ? filteredQuotes : filteredQuotes.slice(0, 5);

    // ==========================================
    // MANEJADORES DE INPUTS
    // ==========================================
    const handleClientInputChange = (e) => {
        const { name, value } = e.target;
        setClientData(prev => ({ ...prev, [name]: value }));
        if (name === 'companyName' && value.length > 1) {
            const filtered = allClients.filter(c => (c.companyName || c.fullName || "").toLowerCase().includes(value.toLowerCase()));
            setFilteredClients(filtered);
            setShowSuggestions(true);
        } else if (name === 'companyName') setShowSuggestions(false);
    };

    const selectClient = (client) => {
        setClientData({
            companyName: client.companyName || client.fullName,
            address: client.address || '',
            attentionTo: client.contactName || client.fullName,
            email: client.email || '',
            phone: client.companyPhone || client.contactPhone || '',
            supervisor: client.assignedUser || '',
            department: 'COMPRAS'
        });
        setShowSuggestions(false);
    };

    const handleRowChange = (index, e) => {
        const { name, value } = e.target;
        const updatedRows = [...serviceRows];
        updatedRows[index][name] = value;
        if (name === 'cantidad' || name === 'pu') {
            const subtotal = (parseFloat(updatedRows[index].cantidad) || 0) * (parseFloat(updatedRows[index].pu) || 0);
            updatedRows[index].subtotal = subtotal.toFixed(2);
            updatedRows[index].iva = (subtotal * 0.16).toFixed(2);
            updatedRows[index].total = (subtotal * 1.16).toFixed(2);
        }
        setServiceRows(updatedRows);
    };

    const addRow = () => setServiceRows([...serviceRows, { description: '', cantidad: 1, um: 'SERVICIO', pu: 0, subtotal: 0, iva: 0, total: 0, comments: '' }]);
    const removeRow = (index) => { if (serviceRows.length > 1) setServiceRows(serviceRows.filter((_, i) => i !== index)); };
    const toggleObservacion = (op) => setObservacionesSeleccionadas(prev => prev.includes(op) ? prev.filter(i => i !== op) : [...prev, op]);

    const globalSubtotal = serviceRows.reduce((acc, row) => acc + parseFloat(row.subtotal || 0), 0).toFixed(2);
    const globalIva = (globalSubtotal * 0.16).toFixed(2);
    const globalTotal = (globalSubtotal * 1.16).toFixed(2);

    // ==========================================
    // LÓGICA DE PDF (COMPARTIDA)
    // ==========================================
    const renderPDFContent = (doc, client, rows, quoteNum, dateStr, descGen, obsSel) => {
        const image = new Image();
        image.src = '/logo_mr.png';
        image.onload = () => {
            doc.addImage(image, 'PNG', 17, 7, 35, 0);
            doc.setFontSize(22); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
            doc.text("Cotización", 195, 20, { align: 'right' });
            doc.setFontSize(11); doc.text(`NUM: ${String(quoteNum).padStart(3, '0')}`, 195, 28, { align: 'right' });
            
            doc.setFontSize(8); doc.text("EMISOR:", 15, 45); doc.setFont("helvetica", "normal");
            doc.text("Materiales Reutilizables SA de CV\nBenito Juárez 112 sur\nCol. 1° de Mayo, Lerdo. Dgo\nC.P. 35169", 15, 50);
            doc.setFont("helvetica", "bold"); doc.text(`SUPERVISOR: ${client.supervisor || "N/A"}`, 15, 70); doc.text(`FECHA: ${dateStr}`, 15, 75);
            
            const rightCol = 110; doc.text("CLIENTE:", rightCol, 45); doc.setFont("helvetica", "normal");
            doc.text((client.companyName || "").toUpperCase(), rightCol + 15, 45);
            doc.text(`ATENCIÓN A: ${(client.attentionTo || "").toUpperCase()}`, rightCol, 52);
            doc.text(`DEPARTAMENTO: ${(client.department || "COMPRAS").toUpperCase()}`, rightCol, 59);
            const splitAddress = doc.splitTextToSize((client.address || "").toUpperCase(), 70);
            doc.text("DOMICILIO: ", rightCol, 66); doc.text(splitAddress, rightCol + 18, 66);
            doc.text(`CELULAR: ${client.phone || "N/A"}`, rightCol, 82); doc.text(`CORREO: ${client.email || "N/A"}`, rightCol, 88);

            let currentY = 95;
            if (descGen) {
                doc.setFont("helvetica", "bold"); doc.text("DESCRIPCIÓN DEL SERVICIO / PRODUCTO:", 15, currentY);
                doc.setFont("helvetica", "normal"); const splitDesc = doc.splitTextToSize(descGen, 180);
                doc.text(splitDesc, 15, currentY + 5); currentY += 10 + (splitDesc.length * 4);
            }

            const tableData = rows.map(row => [
                row.cantidad, 
                (row.um || "SERVICIO").toUpperCase(), 
                row.description, 
                (row.comments || "S/NOTAS").toUpperCase(), 
                `$${Number(row.pu).toLocaleString('es-MX', {minimumFractionDigits: 2})}`, 
                `$${Number(row.subtotal).toLocaleString('es-MX', {minimumFractionDigits: 2})}`
            ]);

            doc.autoTable({
                startY: currentY, head: [['CANT', 'UNIDAD', 'DESCRIPCIÓN', 'Notas', 'P. UNITARIO', 'IMPORTE']], body: tableData, theme: 'grid',
                headStyles: { fillColor: [255, 204, 0], textColor: [0, 0, 0], fontSize: 8, halign: 'center' },
                styles: { fontSize: 7, cellPadding: 2 },
                columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 1: { halign: 'center', cellWidth: 18 }, 4: { halign: 'right', cellWidth: 22 }, 5: { halign: 'right', cellWidth: 22 } }
            });

            const finalY = doc.lastAutoTable.finalY;
            doc.autoTable({
                startY: finalY + 1,
                body: [['SUBTOTAL:', `$${Number(globalSubtotal).toLocaleString()}`], ['IVA (16%):', `$${Number(globalIva).toLocaleString()}`], ['TOTAL:', `$${Number(globalTotal).toLocaleString()}`]],
                theme: 'grid', styles: { fontSize: 8, halign: 'right', fontStyle: 'bold' },
                columnStyles: { 0: { cellWidth: 22, fillColor: [245, 245, 245] }, 1: { cellWidth: 22 } }, margin: { left: 152 },
                didParseCell: (data) => { if (data.row.index === 2) { data.cell.styles.fillColor = [255, 204, 0]; data.cell.styles.textColor = [0, 0, 0]; } }
            });

            let notesY = doc.lastAutoTable.finalY + 10;
            doc.setFont("helvetica", "bold"); doc.text("NOTAS Y CONDICIONES", 15, notesY); doc.setFont("helvetica", "normal");
            obsSel.forEach((obs, index) => doc.text(`• ${obs}`, 15, notesY + 6 + (index * 5)));
            
            doc.save(`Cotizacion_${client.companyName || 'Sin_Nombre'}.pdf`);
        };
    };

    const generatePDF = async () => {
        if (!clientData.companyName) return alert("Ingresa el nombre de la empresa");
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const changed = hasChanges();
            const finalNum = (changed || !originalQuoteLoaded) ? quoteNumber : originalQuoteLoaded.quoteNumber;

            if (changed || !originalQuoteLoaded) {
                await axios.post('/api/quotes', {
                    ...clientData, quoteNumber: finalNum, total: globalTotal, items: serviceRows, 
                    descripcionGeneral, observaciones: observacionesSeleccionadas
                }, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Cotización guardada exitosamente");
                setQuoteNumber(prev => prev + 1);
            }

            const doc = new jsPDF();
            renderPDFContent(doc, clientData, serviceRows, finalNum, currentDate, descripcionGeneral, observacionesSeleccionadas);
            setOriginalQuoteLoaded(null);
            fetchInitialData();
            setIsSaving(false);
        } catch (error) { 
            console.error(error); 
            setIsSaving(false);
            toast.error("Error al guardar");
        }
    };

    return (
        <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8 font-sans flex flex-col gap-10">
            <ToastContainer theme="dark" position="bottom-right" />
            
            <div className="max-w-7xl mx-auto w-full bg-[#1f2937] p-6 rounded-3xl border border-gray-700 shadow-2xl">
                <h1 className="text-2xl font-black text-blue-400 uppercase mb-8 border-b border-gray-700 pb-4 flex justify-between items-center">
                    {originalQuoteLoaded ? "Modificando Cotización" : "Generador de Cotización"} 
                    <span className="text-yellow-500 font-mono">#{originalQuoteLoaded ? originalQuoteLoaded.quoteNumber : quoteNumber}</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 relative" ref={suggestionsRef}>
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Empresa</label>
                            <input type="text" name="companyName" autoComplete="off" value={clientData.companyName} onChange={handleClientInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" />
                            {showSuggestions && filteredClients.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-[#1f2937] border border-gray-600 rounded-xl mt-1 z-50 shadow-2xl max-h-60 overflow-y-auto">
                                    {filteredClients.map((client) => (
                                        <div key={client.id} onClick={() => selectClient(client)} className="p-3 hover:bg-blue-600 cursor-pointer border-b border-gray-700 last:border-0">
                                            <div className="text-sm font-bold">{client.companyName || client.fullName}</div>
                                            <div className="text-[10px] text-gray-400 uppercase">{client.contactName}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {[
                            { label: 'Domicilio', name: 'address' }, { label: 'Atención a', name: 'attentionTo' },
                            { label: 'Departamento', name: 'department' }, { label: 'Email', name: 'email' },
                            { label: 'Teléfono', name: 'phone' }, { label: 'Asesor', name: 'supervisor' }
                        ].map((field) => (
                            <div key={field.name} className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">{field.label}</label>
                                <input type="text" name={field.name} value={clientData[field.name]} onChange={handleClientInputChange} className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-blue-400 uppercase ml-1 tracking-widest">Descripción del Producto / Servicio</label>
                        <textarea value={descripcionGeneral} onChange={(e) => setDescripcionGeneral(e.target.value)} placeholder="Escriba la descripción..." className="bg-[#0e1624] p-4 rounded-2xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all h-full min-h-[150px] resize-none" />
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Producto/Servicio de la Cotización</h2>
                    {serviceRows.map((row, index) => (
                        <div key={index} className="bg-[#0e1624]/50 p-4 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-3 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-600 uppercase">Descripción</label>
                                <input type="text" name="description" value={row.description} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm" />
                            </div>
                            <div className="md:col-span-1 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-600 uppercase text-center">U.M.</label>
                                <input type="text" name="um" value={row.um} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-center uppercase" />
                            </div>
                            <div className="md:col-span-1 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-600 uppercase text-center">P.U.</label>
                                <input type="number" name="pu" value={row.pu} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-green-400 font-bold text-center" />
                            </div>
                            <div className="md:col-span-1 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-600 uppercase text-center">Cant.</label>
                                <input type="number" name="cantidad" value={row.cantidad} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-center font-bold" />
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-600 uppercase text-right">Subtotal</label>
                                <div className="bg-[#1f2937]/30 p-2 rounded-lg text-sm font-black text-blue-400 text-right">$ {row.subtotal}</div>
                            </div>
                            <div className="md:col-span-1 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-600 uppercase text-right">IVA (16%)</label>
                                <div className="bg-[#1f2937]/30 p-2 rounded-lg text-sm font-bold text-yellow-600 text-right">$ {row.iva}</div>
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-gray-600 uppercase text-right">Total</label>
                                <div className="bg-[#1f2937]/50 p-2 rounded-lg text-sm font-black text-green-500 text-right border border-green-900/30">$ {row.total}</div>
                            </div>
                            <div className="md:col-span-3 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-yellow-600/60 uppercase">Notas del producto</label>
                                <input 
                                type="text" 
                                name="comments" 
                                placeholder="Eje: Entrega inmediata..."
                                value={row.comments || ''} 
                                onChange={(e) => handleRowChange(index, e)} 
                                className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-xs text-gray-300 outline-none focus:border-yellow-500/50 transition-all" 
                                />
                            </div>
                            <div className="md:col-span-1 flex flex-col gap-1">
                                <button type="button" onClick={() => removeRow(index)} className="w-full bg-red-600/10 text-red-500 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"><FiTrash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addRow} className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase hover:text-blue-400 transition-colors">
                        <FiPlus /> Agregar Fila
                    </button>
                </div>

                <div className="mb-10 bg-[#0e1624]/30 p-6 rounded-[2rem] border border-gray-800">
                    <h2 className="text-sm font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FiFileText /> Términos y Observaciones</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {opcionesObservaciones.map((opcion, i) => (
                            <div key={i} onClick={() => toggleObservacion(opcion)} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${observacionesSeleccionadas.includes(opcion) ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg' : 'bg-[#1f2937]/50 border-gray-700 text-gray-500'}`}>
                                <div className="mt-1">{observacionesSeleccionadas.includes(opcion) ? <FiCheckSquare size={16}/> : <FiSquare size={16}/>}</div>
                                <span className="text-[10px] font-bold uppercase">{opcion}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    {originalQuoteLoaded && (
                        <button onClick={() => { setOriginalQuoteLoaded(null); setServiceRows([{ description: '', cantidad: 1, um: 'SERVICIO', pu: 0, subtotal: 0, iva: 0, total: 0, comments: '' }]); }} className="px-8 py-4 bg-red-600/10 text-red-500 rounded-2xl font-black text-xs uppercase transition-all">
                            Cancelar Edición
                        </button>
                    )}
                    <button onClick={generatePDF} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">
                        {isSaving ? "Procesando..." : originalQuoteLoaded ? "Guardar Nueva Versión" : "Descargar y Guardar"}
                    </button>
                </div>
            </div>

            {/* SECCIÓN DE HISTORIAL */}
            <div className="max-w-7xl mx-auto w-full bg-[#1f2937] p-6 rounded-3xl border border-gray-700 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2"><FiFileText className="text-blue-400" /> Historial Reciente</h2>
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Buscar por Empresa o Producto..." className="w-full bg-[#0e1624] border border-gray-700 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500 transition-all" value={listSearchTerm} onChange={(e) => setListSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-800">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#0e1624] text-gray-400 font-black uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="p-4">Folio</th>
                                <th className="p-4">Empresa</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Total</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {displayedQuotes.map((q) => (
                                <tr key={q.id} className="hover:bg-[#111827] transition-colors">
                                    <td className="p-4 font-mono text-yellow-500">#{String(q.quoteNumber).padStart(3, '0')}</td>
                                    <td className="p-4 font-bold uppercase">{q.companyName}</td>
                                    <td className="p-4 text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-green-500 font-black">${q.total}</td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <button className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all" onClick={() => {
                                            const doc = new jsPDF();
                                            renderPDFContent(doc, q, q.items, q.quoteNumber, new Date(q.createdAt).toLocaleDateString(), q.descripcionGeneral, q.observaciones);
                                        }} title="Descargar PDF">
                                            <FiDownload />
                                        </button>
                                        <button className="p-2 bg-yellow-600/10 text-yellow-500 rounded-lg hover:bg-yellow-600 hover:text-white transition-all" onClick={() => loadQuoteToForm(q)} title="Cargar para Modificar">
                                            <FiEdit3 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CreateQuote;