import { useEffect, useState } from 'react'; 
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRouter } from 'next/router'; // 1. Importación necesaria

const CreateQuote = () => {
  const router = useRouter(); // Inicializar router
  const [quoteNumber, setQuoteNumber] = useState(1);
  const [currentDate, setCurrentDate] = useState("");
  const [detallesAdicionales, setDetallesAdicionales] = useState('');

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

  // Estructura de fila mejorada con cantidad y total
  const [serviceRows, setServiceRows] = useState([
    { description: '', cantidad: 1, um: 'Pieza', pu: 0, total: 0, comments: '' }
  ]);

  // 2. RECIBIR DATOS DEL CALENDARIO
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

  // 3. LÓGICA DE CÁLCULO AUTOMÁTICO
  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...serviceRows];
    updatedRows[index][name] = value;

    // Si cambia cantidad o precio unitario, calcular total de la fila
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

  // Calcular el gran total de la cotización
  const grandTotal = serviceRows.reduce((acc, row) => acc + parseFloat(row.total || 0), 0).toFixed(2);

  const generatePDF = () => {
    const doc = new jsPDF();
    localStorage.setItem('quoteNumber', quoteNumber);
    const imgUrl = '/logo_mr.png';
    const image = new Image();
    image.src = imgUrl;

    image.onload = () => {
      doc.addImage(image, 'PNG', 20, 10, 30, 30);
      // Header empresa... (tu lógica de texto se mantiene igual)
      doc.setFontSize(10);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      
      // Rectángulo de folio
      doc.setFillColor(255, 204, 0);
      doc.rect(160, 20, 40, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text("COTIZACIÓN", 180, 27, { align: 'center' });
      doc.text(`Nº ${quoteNumber}`, 180, 35, { align: 'center' });

      // Tabla de Cliente
      doc.autoTable({
        startY: 50,
        head: [['CONCEPTO', 'DATOS DEL CLIENTE']],
        body: [
          ['EMPRESA', clientData.companyName],
          ['TELÉFONO', clientData.phone],
          ['ATENCIÓN', clientData.attentionTo]
        ],
        theme: 'grid',
        headStyles: { fillColor: [255, 204, 0], textColor: 0 }
      });

      // Tabla de Servicios
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

      doc.save(`Cotizacion_${clientData.companyName}.pdf`);
    };
  };

  return (
    <div className="min-h-screen bg-[#0e1624] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-[#1f2937] p-6 rounded-3xl border border-gray-700 shadow-2xl">
        <h1 className="text-2xl font-black text-blue-400 uppercase mb-8 border-b border-gray-700 pb-4">
          Generador de Cotización <span className="text-yellow-500 ml-2">#{quoteNumber}</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Inputs de Cliente con estilo mejorado */}
          {[
            { label: 'Empresa', name: 'companyName' },
            { label: 'Domicilio', name: 'address' },
            { label: 'Atención a', name: 'attentionTo' },
            { label: 'Teléfono', name: 'phone' },
            { label: 'Email', name: 'email' },
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

        {/* TABLA DE CONCEPTOS DINÁMICA */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-yellow-500 uppercase tracking-widest">Servicios/Productos</h2>
          {serviceRows.map((row, index) => (
            <div key={index} className="bg-[#0e1624]/50 p-4 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative">
              <div className="md:col-span-4 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Descripción</label>
                <input type="text" name="description" value={row.description} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-white" />
              </div>
              <div className="md:col-span-1 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Cant.</label>
                <input type="number" name="cantidad" value={row.cantidad} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-white" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">P. Unitario</label>
                <input type="number" name="pu" value={row.pu} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-green-400 font-bold" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Total</label>
                <div className="bg-[#1f2937]/30 p-2 rounded-lg border border-transparent text-sm font-black text-blue-400">$ {row.total}</div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-600 uppercase">Notas</label>
                <input type="text" name="comments" value={row.comments} onChange={(e) => handleRowChange(index, e)} className="bg-[#1f2937] p-2 rounded-lg border border-gray-700 text-sm text-white" />
              </div>
              <div className="md:col-span-1">
                <button type="button" onClick={() => removeRow(index)} className="w-full bg-red-600/20 text-red-500 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">✖</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <button type="button" onClick={addRow} className="text-xs font-black text-blue-500 uppercase hover:text-blue-400">+ Agregar concepto</button>
          <div className="text-2xl font-black text-white bg-blue-600/20 px-6 py-2 rounded-2xl border border-blue-500/30">
            TOTAL: <span className="text-yellow-500">${grandTotal}</span>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-700 flex gap-4">
          <button onClick={generatePDF} className="flex-1 bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">
            Descargar Cotización PDF
          </button>
          <button onClick={() => router.back()} className="px-8 bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl font-black text-xs uppercase text-gray-400 transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuote;