import { useEffect, useState } from 'react'; 
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRouter } from 'next/router';
import { FiCheckSquare, FiSquare, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi';

const CreateQuote = () => {
  const router = useRouter();
  const [quoteNumber, setQuoteNumber] = useState(1);
  const [currentDate, setCurrentDate] = useState("");
  
  // ESTADOS PARA LOS NUEVOS CAMPOS
  const [descripcionGeneral, setDescripcionGeneral] = useState("");
  const [observacionesSeleccionadas, setObservacionesSeleccionadas] = useState([]);

  // OPCIONES OFICIALES PARA OBSERVACIONES (MULTISELECCIÓN)
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

  const [serviceRows, setServiceRows] = useState([
    { description: '', cantidad: 1, um: 'Pieza', pu: 0, total: 0, comments: '' }
  ]);

  // LÓGICA DE SELECCIÓN MÚLTIPLE
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

  const handleClientInputChange = (e) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...serviceRows];
    updatedRows[index][name] = value;

    if (name === 'cantidad' || name === 'pu') {
      const cant = parseFloat(updatedRows[index].cantidad) || 0;
      const precio = parseFloat(updatedRows[index].pu) || 0;
      updatedRows[index].total = (cant * precio).toFixed(2);
    }
    setServiceRows(updatedRows);
  };

  const addRow = () => {
    setServiceRows([...serviceRows, { description: '', cantidad: 1, um: 'Pieza', pu: 0, total: 0, comments: '' }]);
  };

  const removeRow = (index) => {
    if (serviceRows.length > 1) {
      setServiceRows(serviceRows.filter((_, i) => i !== index));
    }
  };

  const grandTotal = serviceRows.reduce((acc, row) => acc + parseFloat(row.total || 0), 0).toFixed(2);

  const generatePDF = () => {
    const doc = new jsPDF();
    localStorage.setItem('quoteNumber', quoteNumber);
    const imgUrl = '/logo_mr.png';
    const image = new Image();
    image.src = imgUrl;

    image.onload = () => {
      doc.addImage(image, 'PNG', 20, 10, 30, 30);
      doc.setFontSize(10);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      
      doc.setFillColor(255, 204, 0);
      doc.rect(160, 20, 40, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("COTIZACIÓN", 180, 27, { align: 'center' });
      doc.text(`Nº ${quoteNumber}`, 180, 35, { align: 'center' });

      doc.autoTable({
        startY: 50,
        head: [['CONCEPTO', 'DATOS DEL CLIENTE']],
        body: [
          ['EMPRESA', clientData.companyName],
          ['TELÉFONO', clientData.phone],
          ['ATENCIÓN', clientData.attentionTo],
          ['FECHA', currentDate]
        ],
        theme: 'grid',
        headStyles: { fillColor: [255, 204, 0], textColor: 0 }
      });

      const tableData = serviceRows.map((row, i) => [
        i + 1, row.description, row.cantidad, row.um, `$${row.pu}`, `$${row.total}`
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['NO', 'DESCRIPCIÓN', 'CANT', 'UM', 'P.U.', 'TOTAL']],
        body: [...tableData, ['', '', '', '', 'TOTAL:', `$${grandTotal}`]],
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] }
      });

      // SECCIÓN FINAL DEL PDF: DESCRIPCIÓN Y OBSERVACIONES MÚLTIPLES
      let currentY = doc.lastAutoTable.finalY + 15;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DETALLES DEL SERVICIO:", 14, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(descripcionGeneral || "Servicios generales descritos en tabla superior.", 14, currentY + 7);

      currentY += 20;
      doc.setFont("helvetica", "bold");
      doc.text("OBSERVACIONES Y CONDICIONES COMERCIALES:", 14, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      observacionesSeleccionadas.forEach((obs, index) => {
        doc.text(`- ${obs}`, 14, currentY + 7 + (index * 6));
      });

      doc.save(`Cotizacion_${clientData.companyName}.pdf`);
    };
  };

  return (
    <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-[#1f2937] p-6 rounded-3xl border border-gray-700 shadow-2xl">
        <h1 className="text-2xl font-black text-blue-400 uppercase mb-8 border-b border-gray-700 pb-4 flex justify-between items-center">
          Generador de Cotización <span className="text-yellow-500 font-mono">#{quoteNumber}</span>
        </h1>

        {/* SECCIÓN CLIENTE Y DESCRIPCIÓN GENERAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Empresa', name: 'companyName' },
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
            <label className="text-[10px] font-black text-blue-400 uppercase ml-1 tracking-widest">Descripción del Servicio (PDF)</label>
            <textarea 
              value={descripcionGeneral}
              onChange={(e) => setDescripcionGeneral(e.target.value)}
              placeholder="Escriba la descripción general que aparecerá al pie del PDF..."
              className="bg-[#0e1624] p-4 rounded-2xl border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all h-full min-h-[150px] resize-none"
            />
          </div>
        </div>

        {/* SELECTOR MÚLTIPLE DE OBSERVACIONES */}
        <div className="mb-10 bg-[#0e1624]/30 p-6 rounded-[2rem] border border-gray-800">
          <h2 className="text-sm font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FiFileText /> Términos y Observaciones (Selección Múltiple)
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

        {/* TABLA DE CONCEPTOS */}
        <div className="space-y-4 mb-8">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Partidas de la Cotización</h2>
          {serviceRows.map((row, index) => (
            <div key={index} className="bg-[#0e1624]/50 p-4 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Descripción de la partida</label>
                <input type="text" name="description" value={row.description} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm" />
              </div>
              <div className="md:col-span-1 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Cant.</label>
                <input type="number" name="cantidad" value={row.cantidad} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">P. Unitario</label>
                <input type="number" name="pu" value={row.pu} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-green-400 font-bold" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Subtotal</label>
                <div className="bg-[#1f2937]/30 p-2 rounded-lg text-sm font-black text-blue-400">$ {row.total}</div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Notas partida</label>
                <input type="text" name="comments" value={row.comments} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm opacity-60" />
              </div>
              <div className="md:col-span-1">
                <button type="button" onClick={() => removeRow(index)} className="w-full bg-red-600/10 text-red-500 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all"><FiTrash2 size={16}/></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addRow} className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase hover:text-blue-400 transition-colors">
            <FiPlus /> Agregar Partida
          </button>
        </div>

        {/* TOTAL Y ACCIONES */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-700 pt-8">
          <div className="text-3xl font-black text-white">
            TOTAL: <span className="text-yellow-500 font-mono">${grandTotal}</span>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={generatePDF} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">
              Descargar Cotización PDF
            </button>
            <button onClick={() => router.back()} className="px-8 bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl font-black text-xs uppercase text-gray-500">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuote;