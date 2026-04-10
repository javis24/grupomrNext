import { useEffect, useState, useRef } from 'react'; 
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRouter } from 'next/router';
import axios from 'axios'; 
import { toast, ToastContainer } from 'react-toastify'; // Opcional pero recomendado para feedback
import { FiCheckSquare, FiSquare, FiFileText, FiPlus, FiTrash2, } from 'react-icons/fi';

const CreateQuote = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState(1);
  const [currentDate, setCurrentDate] = useState("");

  const [allClients, setAllClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);


  
  const [descripcionGeneral, setDescripcionGeneral] = useState("");
  const [observacionesSeleccionadas, setObservacionesSeleccionadas] = useState([]);




  const opcionesObservaciones = [
    "PRECIO DURANTE EL PRESENTE AÑO",
    "PRECIOS MAS IVA",
    "PRECIOS ANTES DE IMPUESTOS",
    "INCLUYE GASTOS DE ENTREGA",
    "LAB NUESTRA BODEGA",
    "TERMINOS DE ENTREGA 4 SEMANAS",
    "TERMINOS DE ENTREGA 15 DIAS",
    "TERMINOS DE ENTREGA 8 DIAS",
    "TIEMPO DE RESPUESTA: CON PROGRAMAMCION DE 24 HRS.",
    "CONDICIONES DE PAGO: CREDITO",
    "CONDICIONES DE PAGO: CONTADO",
    "CONDICIONES DE PAGO: CON ANTICIPO",
    "VIGENCIA DE LA COTIZACION: 15 DIAS",
    "CONTAMOS CON LOS PERMISOS Y AUORIZACIONES NECESARIOS PARA EL DESARROLLO DE NUESTRAS ACTIVIDADES",
    "INCLUYE ELABORACION Y ENTREGA DE MANIFIESTOS. SOLICITARLO AL CONTRATAR SERVICIOS."
  ];

  const [clientData, setClientData] = useState({
    companyName: '',
    address: '',
    attentionTo: '',
    department: '',
    email: '',
    phone: '',
    mobile: '',
    supervisor: '',
    assigned: '',
  });

  // Estructura de fila con Subtotal, IVA y Total
  const [serviceRows, setServiceRows] = useState([
    { description: '', cantidad: 1, um: 'Pieza', pu: 0, subtotal: 0, iva: 0, total: 0, comments: '' }
  ]);

  const toggleObservacion = (opcion) => {
    if (observacionesSeleccionadas.includes(opcion)) {
      setObservacionesSeleccionadas(observacionesSeleccionadas.filter(item => item !== opcion));
    } else {
      setObservacionesSeleccionadas([...observacionesSeleccionadas, opcion]);
    }
  };


  

  useEffect(() => {
    if (router.isReady) {
      const { client, phone, address } = router.query;
      if (client) {
        setClientData(prev => ({
          ...prev,
          companyName: client,
          phone: phone || '',
          address: address || '',
          attentionTo: client
        }));
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    const lastQuoteNumber = localStorage.getItem('quoteNumber');
    if (lastQuoteNumber) {
      setQuoteNumber(parseInt(lastQuoteNumber) + 1);
    }
    setCurrentDate(new Date().toLocaleDateString('es-MX'));
  }, []);

// 1. CARGAR TODOS LOS CLIENTES AL INICIO
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllClients(res.data);
      } catch (err) {
        console.error("Error cargando clientes para autocompletado", err);
      }
    };
    fetchClients();
  }, []);

  // 2. CERRAR SUGERENCIAS SI SE HACE CLIC FUERA
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. MANEJADOR DE ENTRADA CON FILTRO
  const handleClientInputChange = (e) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));

    if (name === 'companyName') {
      if (value.length > 1) {
        const filtered = allClients.filter(client =>
          (client.companyName || client.fullName).toLowerCase().includes(value.toLowerCase())
        );
        setFilteredClients(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  // 4. SELECCIONAR CLIENTE DE LA LISTA
  const selectClient = (client) => {
    setClientData({
      companyName: client.companyName || client.fullName,
      address: client.address || '',
      attentionTo: client.contactName || client.fullName,
      email: client.email || '',
      phone: client.companyPhone || client.contactPhone || '',
      supervisor: client.assignedUser || '',
    });
    setShowSuggestions(false);
  };

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...serviceRows];
    updatedRows[index][name] = value;

    if (name === 'cantidad' || name === 'pu') {
      const cant = parseFloat(updatedRows[index].cantidad) || 0;
      const precio = parseFloat(updatedRows[index].pu) || 0;
      
      const subtotal = cant * precio;
      const iva = subtotal * 0.16; // Cálculo de IVA 16%
      const total = subtotal + iva;

      updatedRows[index].subtotal = subtotal.toFixed(2);
      updatedRows[index].iva = iva.toFixed(2);
      updatedRows[index].total = total.toFixed(2);
    }
    setServiceRows(updatedRows);
  };

  const addRow = () => {
    setServiceRows([...serviceRows, { description: '', cantidad: 1, um: 'Pieza', pu: 0, subtotal: 0, iva: 0, total: 0, comments: '' }]);
  };

  const removeRow = (index) => {
    if (serviceRows.length > 1) {
      setServiceRows(serviceRows.filter((_, i) => i !== index));
    }
  };

  // Cálculos globales
  const globalSubtotal = serviceRows.reduce((acc, row) => acc + parseFloat(row.subtotal || 0), 0).toFixed(2);
  const globalIva = serviceRows.reduce((acc, row) => acc + parseFloat(row.iva || 0), 0).toFixed(2);
  const globalTotal = serviceRows.reduce((acc, row) => acc + parseFloat(row.total || 0), 0).toFixed(2);

  const generatePDF = async () => {
    if (!clientData.companyName) {
        alert("Por favor ingresa el nombre de la empresa");
        return;
    }

    setIsSaving(true);

    try {
        const token = localStorage.getItem('token');
        
        // 1. Guardar en Base de Datos
        await axios.post('/api/quotes', {
            quoteNumber,
            companyName: clientData.companyName,
            attentionTo: clientData.attentionTo,
            email: clientData.email,
            phone: clientData.phone,
            total: globalTotal,
        }, { headers: { Authorization: `Bearer ${token}` } });

        // 2. Iniciar generación de PDF
        const doc = new jsPDF();
        const image = new Image();
        image.src = '/logo_mr.png'; // Asegúrate de que el logo sea transparente

        image.onload = () => {
            // --- ENCABEZADO ---
            doc.addImage(image, 'PNG', 17, 7, 35, 0);
            
            doc.setFontSize(22);
            doc.setTextColor(255, 204, 0); // Color Naranja/Ocre del diseño
            doc.setFont("helvetica", "bold");
            doc.text("Cotización", 195, 20, { align: 'right' });
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`NUM: ${String(quoteNumber).padStart(3, '0')}`, 195, 28, { align: 'right' });

            // --- BLOQUE EMISOR Y CLIENTE ---
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            
            // Columna Izquierda (EMISOR)
            doc.text("EMISOR:", 15, 45);
            doc.setFont("helvetica", "normal");
            doc.text("Materiales Reutilizables SA de CV", 15, 50);
            doc.text("Benito Juárez 112 sur", 15, 54);
            doc.text("Col. 1° de Mayo, Lerdo. Dgo", 15, 58);
            doc.text("C.P. 35169", 15, 62);
            
            doc.setFont("helvetica", "bold");
            doc.text("SUPERVISOR ASIGNADO:", 15, 70);
            doc.setFont("helvetica", "normal");
            doc.text(clientData.supervisor || "N/A", 55, 70);
            
            doc.setFont("helvetica", "bold");
            doc.text("FECHA:", 15, 75);
            doc.setFont("helvetica", "normal");
            doc.text(currentDate, 30, 75);

           const rightCol = 110;
            const startYRight = 45; // Punto de inicio para mantener alineación con EMISOR

            doc.setFont("helvetica", "bold");
            doc.text("CLIENTE:", rightCol, startYRight);
            doc.setFont("helvetica", "normal");
            doc.text((clientData.companyName || "").toUpperCase(), rightCol + 15, startYRight);

            doc.setFont("helvetica", "bold");
            doc.text("ATENCIÓN A:", rightCol, startYRight + 7); // y=52
            doc.setFont("helvetica", "normal");
            doc.text((clientData.attentionTo || "").toUpperCase(), rightCol + 22, startYRight + 7);

            // --- LÍNEA DE DEPARTAMENTO ---
            doc.setFont("helvetica", "bold");
            doc.text("DEPARTAMENTO:", rightCol, startYRight + 14); // y=59
            doc.setFont("helvetica", "normal");
            // Usamos String() para asegurar que el texto sea procesado correctamente
            const deptText = String(clientData.department || "COMPRAS").toUpperCase();
            doc.text(deptText, rightCol + 28, startYRight + 14);

            doc.setFont("helvetica", "bold");
            doc.text("DOMICILIO:", rightCol, startYRight + 21); // y=66
            doc.setFont("helvetica", "normal");
            const splitAddress = doc.splitTextToSize((clientData.address || "").toUpperCase(), 70);
            doc.text(splitAddress, rightCol + 18, startYRight + 21);

            // Ajustamos Celular y Correo más abajo para que el domicilio largo no los tape
            doc.setFont("helvetica", "bold");
            doc.text("CELULAR:", rightCol, startYRight + 34); // y=79
            doc.setFont("helvetica", "normal");
            doc.text(String(clientData.phone || "N/A"), rightCol + 18, startYRight + 34);

            doc.setFont("helvetica", "bold");
            doc.text("CORREO:", rightCol, startYRight + 41); // y=86
            doc.setFont("helvetica", "normal");
            doc.text((clientData.email || "N/A").toLowerCase(), rightCol + 15, startYRight + 41);

            let currentY = 90; // Ajustamos la posición Y
            if (descripcionGeneral) {
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0, 0, 0); // Color naranja/ocre
                doc.text("DESCRIPCIÓN DEL SERVICIO / PRODUCTO:", 15, currentY);
                
                doc.setFont("helvetica", "normal");
                doc.setTextColor(0, 0, 0);
                // Dividimos el texto para que no se salga del ancho de la hoja
                const splitDesc = doc.splitTextToSize(descripcionGeneral.toUpperCase(), 180);
                doc.text(splitDesc, 15, currentY + 5);
                
                // Calculamos cuánto espacio ocupó el texto para mover la tabla hacia abajo
                const lines = splitDesc.length;
                currentY = currentY + 10 + (lines * 4); 
            } else {
                currentY = 90; // Si no hay descripción, mantenemos un margen pequeño
            }

            // --- TABLA DE PRODUCTOS ---
            const tableData = serviceRows.map((row) => [
                row.cantidad,
                row.um,
                row.description.toUpperCase(),
                row.comments ? row.comments.toUpperCase() : '',
                `$${Number(row.pu).toLocaleString('es-MX', {minimumFractionDigits: 2})}`,
                `$${Number(row.subtotal).toLocaleString('es-MX', {minimumFractionDigits: 2})}`
            ]);

            doc.autoTable({
                startY: currentY, 
                head: [['CANT', 'UNIDAD', 'DESCRIPCIÓN','Notas', 'P. UNITARIO', 'IMPORTE']],
                body: tableData,
               theme: 'grid', // Activa las divisiones de renglones y columnas
                headStyles: { 
                    fillColor: [255, 204, 0], 
                    textColor: [0, 0, 0], 
                    fontSize: 8,
                    halign: 'center',
                    lineWidth: 0.1,
                    lineColor: [200, 200, 200]
                },
                styles: { 
                    fontSize: 7, 
                    cellPadding: 2,
                    valign: 'middle',
                    lineWidth: 0.1,
                    lineColor: [230, 230, 230]
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 12 },
                    1: { halign: 'center', cellWidth: 15 },
                    2: { halign: 'left', cellWidth: 'auto' },
                    3: { halign: 'left', cellWidth: 35 },
                    4: { halign: 'right', cellWidth: 22 },
                    5: { halign: 'right', cellWidth: 22 },
                }
            });

           const finalY = doc.lastAutoTable.finalY;
           doc.autoTable({
                  startY: finalY + 1, // Un pequeño espacio para que no pegue las líneas
                  body: [
                      ['SUBTOTAL:', `$${Number(globalSubtotal).toLocaleString('es-MX', {minimumFractionDigits: 2})}`],
                      ['IVA (16%):', `$${Number(globalIva).toLocaleString('es-MX', {minimumFractionDigits: 2})}`],
                      ['TOTAL:', `$${Number(globalTotal).toLocaleString('es-MX', {minimumFractionDigits: 2})}`]
                  ],
                  theme: 'grid',
                  styles: { 
                      fontSize: 8, 
                      halign: 'right', 
                      fontStyle: 'bold',
                      lineWidth: 0.1,
                      lineColor: [200, 200, 200]
                  },
                  columnStyles: {
                      // Ajustamos los anchos para que sumen 44mm igual que las columnas de arriba
                      0: { cellWidth: 22, fillColor: [245, 245, 245] }, 
                      1: { cellWidth: 22 }
                  },
                  // 196 es el borde derecho aproximado, menos 44 de ancho total = 152
                  margin: { left: 152 }, 
                  didParseCell: function(data) {
                      if (data.row.index === 2) { 
                          data.cell.styles.fillColor = [255, 204, 0];
                          data.cell.styles.textColor = [0, 0, 0];
                      }
                  }
              });

            // --- NOTAS Y CONDICIONES ---
            let notesY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("NOTAS Y CONDICIONES", 15, notesY);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            observacionesSeleccionadas.forEach((obs, index) => {
                doc.text(`• ${obs}`, 15, notesY + 6 + (index * 5));
            });

            // --- PIE DE PÁGINA ---
            const pageHeight = doc.internal.pageSize.height;
            doc.setDrawColor(200, 200, 200);
            doc.line(15, pageHeight - 20, 195, pageHeight - 20);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text("Materiales Reutilizables SA de CV  ·  Comercialización", 105, pageHeight - 15, { align: 'center' });
            doc.text(`Página 1 de 1`, 195, pageHeight - 10, { align: 'right' });

            // Finalizar
            localStorage.setItem('quoteNumber', quoteNumber);
            doc.save(`Cotizacion_${clientData.companyName}.pdf`);
            setIsSaving(false);
            alert("Cotización generada correctamente.");
        };

        image.onerror = () => {
            alert("Error al cargar el logo. Asegúrate de que el archivo existe en /public/logo_mr.png");
            setIsSaving(false);
        };

    } catch (error) {
        console.error("Error:", error);
        alert("Error al procesar la cotización.");
        setIsSaving(false);
    }
};
  return (
    <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-[#1f2937] p-6 rounded-3xl border border-gray-700 shadow-2xl">
        <h1 className="text-2xl font-black text-blue-400 uppercase mb-8 border-b border-gray-700 pb-4 flex justify-between items-center">
          Generador de Cotización <span className="text-yellow-500 font-mono">#{quoteNumber}</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 relative" ref={suggestionsRef}>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Empresa</label>
              <input 
                type="text" 
                name="companyName"
                autoComplete="off"
                value={clientData.companyName}
                onChange={handleClientInputChange}
                className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all"
              />
              
              {/* LISTA DE SUGERENCIAS */}
              {showSuggestions && filteredClients.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-[#1f2937] border border-gray-600 rounded-xl mt-1 z-50 shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden">
                  {filteredClients.map((client) => (
                    <div 
                      key={client.id}
                      onClick={() => selectClient(client)}
                      className="p-3 hover:bg-blue-600 cursor-pointer border-b border-gray-700 last:border-0 transition-colors"
                    >
                      <div className="text-sm font-bold text-white">{client.companyName || client.fullName}</div>
                      <div className="text-[10px] text-gray-400 uppercase">{client.contactName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {[
              { label: 'Domicilio', name: 'address' },
              { label: 'Atención a', name: 'attentionTo' },
              { label: 'Email', name: 'email' },
              { label: 'Teléfono', name: 'phone' },
              { label: 'Asesor', name: 'supervisor' }
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1">{field.label}</label>
                <input 
                  type="text" 
                  name={field.name}
                  value={clientData[field.name]}
                  onChange={handleClientInputChange}
                  className="bg-[#0e1624] p-3 rounded-xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-blue-400 uppercase ml-1 tracking-widest">Descripción del Producto / Servicio </label>
            <textarea 
              value={descripcionGeneral}
              onChange={(e) => setDescripcionGeneral(e.target.value)}
              placeholder="Escriba la descripción..."
              className="bg-[#0e1624] p-4 rounded-2xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all h-full min-h-[150px] resize-none"
            />
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
                <label className="text-[9px] font-bold text-gray-600 uppercase">Cant.</label>
                <input type="number" name="cantidad" value={row.cantidad} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-center" />
              </div>
              <div className="md:col-span-1 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">P.U.</label>
                <input type="number" name="pu" value={row.pu} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-green-400 font-bold" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Subtotal</label>
                <div className="bg-[#1f2937]/30 p-2 rounded-lg text-sm font-black text-blue-400">$ {row.subtotal}</div>
              </div>
              <div className="md:col-span-1 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">IVA (16%)</label>
                <div className="bg-[#1f2937]/30 p-2 rounded-lg text-sm font-bold text-yellow-600">$ {row.iva}</div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Total</label>
                <div className="bg-[#1f2937]/50 p-2 rounded-lg text-sm font-black text-green-500 border border-green-900/30">$ {row.total}</div>
              </div>
              <div className="md:col-span-1 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Notas</label>
                <input type="text" name="comments" value={row.comments} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-xs opacity-60" />
              </div>
              <div className="md:col-span-1">
                <button type="button" onClick={() => removeRow(index)} className="w-full bg-red-600/10 text-red-500 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"><FiTrash2 size={16}/></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addRow} className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase hover:text-blue-400 transition-colors">
            <FiPlus /> Agregar Producto/Servicio
          </button>
        </div>
          <div className="mb-10 bg-[#0e1624]/30 p-6 rounded-[2rem] border border-gray-800">
          <h2 className="text-sm font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FiFileText /> Términos y Observaciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {opcionesObservaciones.map((opcion, i) => (
              <div 
                key={i} 
                onClick={() => toggleObservacion(opcion)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  observacionesSeleccionadas.includes(opcion) 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-900/20' 
                  : 'bg-[#1f2937]/50 border-gray-700 text-gray-500 hover:border-gray-500'
                }`}
              >
                <div className="mt-1">
                  {observacionesSeleccionadas.includes(opcion) ? <FiCheckSquare size={16}/> : <FiSquare size={16}/>}
                </div>
                <span className="text-[10px] font-bold leading-tight uppercase">{opcion}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RESUMEN DE TOTALES */}
        <div className="mt-8 flex flex-col items-end gap-2 border-t border-gray-700 pt-8">
            <div className="text-gray-400 text-sm uppercase font-bold">Subtotal: <span className="text-white ml-2">$ {globalSubtotal}</span></div>
            <div className="text-gray-400 text-sm uppercase font-bold">IVA (16%): <span className="text-yellow-600 ml-2">$ {globalIva}</span></div>
            <div className="text-4xl font-black text-white mt-2">
                TOTAL: <span className="text-green-500 font-mono">${globalTotal}</span>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
            <button onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">
                Descargar Cotización PDF
            </button>
            <button onClick={() => router.back()} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-black text-xs uppercase text-gray-500">
                Cerrar
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuote;