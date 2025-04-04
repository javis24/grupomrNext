import { useEffect, useState } from 'react'; 
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CreateQuote = () => {
  const [quoteNumber, setQuoteNumber] = useState(1);
  const [currentDate, setCurrentDate] = useState("");
  const [detallesAdicionales, setDetallesAdicionales] = useState('');

  // Estado para almacenar los datos del cliente ingresados por el usuario
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
    detallesAdicionales: '',
  });

  // Estado para manejar filas dinámicas en la tabla de servicios
  const [serviceRows, setServiceRows] = useState([
    { description: '', um: '', pu: '', comments: '' }
  ]);

  useEffect(() => {
    const lastQuoteNumber = localStorage.getItem('quoteNumber');
    if (lastQuoteNumber) {
      setQuoteNumber(parseInt(lastQuoteNumber) + 1); // Incrementar el número
    } else {
      setQuoteNumber(1); // Si no hay número anterior, inicializar en 1
    }

    const today = new Date();
    setCurrentDate(today.toLocaleDateString());
  }, []);

  // Función para manejar el cambio en los campos del cliente
  const handleClientInputChange = (e) => {
    const { name, value } = e.target;
    setClientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Función para manejar el cambio en las filas
  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...serviceRows];
    updatedRows[index][name] = value;
    setServiceRows(updatedRows);
  };

  // Función para agregar una nueva fila
  const addRow = () => {
    setServiceRows([...serviceRows, { description: '', um: 'Pieza', pu: '', comments: '' }]);
  };

  // Función para generar el PDF con los datos de las filas y del cliente
  const generatePDF = () => {
    const doc = new jsPDF();

    localStorage.setItem('quoteNumber', quoteNumber);

    const imgUrl = '/logo_mr.png';  // Ruta relativa desde el directorio 'public'

    const image = new Image();
    image.src = imgUrl;
    image.onload = () => {
      doc.addImage(image, 'PNG', 20, 10, 40, 40);

      // Información de la empresa
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: 'center' });
      doc.text("MRE040121UBA", 105, 37, { align: 'center' });

      // Cotización
      doc.setFillColor(255, 204, 0); // Color amarillo
      doc.rect(160, 20, 40, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("COTIZACIÓN", 180, 27, null, 'center'); 

      // Número de cotización
      const quoteNumberText = `Nº ${quoteNumber}`;
      const quoteTextWidth = doc.getTextWidth(quoteNumberText);
      doc.text(160 + (40 - quoteTextWidth) / 2, 42, quoteNumberText);  

      // Fecha de la cotización
      const dateTextWidth = doc.getTextWidth(currentDate);
      doc.text(160 + (40 - dateTextWidth) / 2, 57, currentDate); 

      // Datos del cliente
      doc.setFontSize(12);
      doc.setTextColor(255, 165, 0); 
      doc.text("DATOS DEL CLIENTE O SOLICITANTE", 12, 65);

      const clientDetails = [
        ["EMPRESA", clientData.companyName],
        ["DOMICILIO", clientData.address],
        ["ATENCIÓN A", clientData.attentionTo],
        ["DEPARTAMENTO", clientData.department],
        ["CORREO ELECTRÓNICO", clientData.email],
        ["TELÉFONO", clientData.phone],
        ["MÓVIL", clientData.mobile],
        ["SUPERVISOR", clientData.supervisor],
        ["ASIGNADO", clientData.assigned],
      ];

   doc.autoTable({
        body: clientDetails,
        startY: 85,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 204, 0],
          textColor: 0,
        },
      });

      // Tabla de servicios (dinámica)
      const tableData = serviceRows.map((row, index) => [
        index + 1,
        row.description,
        row.um,
        `$${row.pu}`,
        row.comments
      ]);

      doc.autoTable({
        head: [["NO", "DESCRIPCIÓN", "UM", "P.U.", "COMENTARIOS"]],
        body: tableData,
        startY: doc.lastAutoTable.finalY + 10,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 204, 0],
          textColor: 0,
        },
        styles: {
          fontSize: 10,
          halign: 'center',
        }
      });

     

       // Sección de detalles adicionales
       doc.setFontSize(10);
       doc.setTextColor(0, 0, 0);
       doc.setFillColor(255, 204, 0);
       doc.rect(14, doc.lastAutoTable.finalY + 60, 182, 10, 'F');
       doc.text("DETALLES ADICIONALES", 105, doc.lastAutoTable.finalY + 67, null, 'center');
 
       doc.text(detallesAdicionales || "No hay detalles adicionales.", 105, doc.lastAutoTable.finalY + 73, { align: 'center' }); 

       // Pie de página
       doc.setFontSize(8);
       doc.setTextColor(0, 0, 0);
       const footer1 = "Comercialización Grupo MR";
       const footer2 = "Visita nuestra página y conoce más sobre nosotros";
       const footer3 = "www.materialesreutilizables.com";
 
       doc.text(105, 250, footer1, null, 'center'); // Subimos la posición del pie de página
       doc.text(105, 253, footer2, null, 'center');
       doc.setTextColor(0, 0, 255);  // Color azul para el enlace
       doc.textWithLink(footer3, 86, 256, { url: "http://www.materialesreutilizables.com" }); // Movemos el link más a la izquierda
 
       doc.save('cotizacion.pdf');
     };
   };

  return (
          <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Cotización MR</h1>
          <form className="grid grid-cols-1 gap-6">
            {/* Campos de información del cliente */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block">Empresa</label>
                  <input
                    type="text"
                    name="companyName"
                    value={clientData.companyName}
                    onChange={handleClientInputChange}
                    className="p-2 rounded border w-full text-black"
                  />
                </div>
                <div>
                  <label className="block">Domicilio</label>
                  <input
                    type="text"
                    name="address"
                    value={clientData.address}
                    onChange={handleClientInputChange}
                    className="p-2 rounded border w-full text-black"
                  />
                </div>
                <div>
                  <label className="block">Atención a</label>
                  <input
                    type="text"
                    name="attentionTo"
                    value={clientData.attentionTo}
                    onChange={handleClientInputChange}
                    className="p-2 rounded border w-full text-black"
                  />
                </div>
                <div>
                  <label className="block">Teléfono</label>
                  <input
                    type="text"
                    name="phone"
                    value={clientData.phone}
                    onChange={handleClientInputChange}
                    className="p-2 rounded border w-full text-black"
                  />
                </div>
                <div>
                  <label className="block">Móvil</label>
                  <input
                    type="text"
                    name="mobile"
                    value={clientData.mobile}
                    onChange={handleClientInputChange}
                    className="p-2 rounded border w-full text-black"
                  />
                </div>
                <div>
                  <label className="block">Departamento</label>
                  <input
                    type="text"
                    name="department"
                    value={clientData.department}
                    onChange={handleClientInputChange}
                    className="p-2 rounded border w-full text-black"
                  />
                </div>
                <div>
                  <label className="block">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={clientData.email}
                    onChange={handleClientInputChange}
                    className="p-2 rounded border w-full text-black"
                  />
                </div>
                <div>
                  <label className="block">Asesor Comercial</label>
                  <input
                    type="text"
                    name="supervisor"
                    value={clientData.supervisor}
                    onChange={handleClientInputChange}
                    className="p-2 rounded border w-full text-black"
                  />
                </div>
                {/* Campo para Detalles Adicionales */}
                <div className="mb-4">
                  <label className="block">Detalles Adicionales</label>
                  <textarea
                    value={detallesAdicionales}
                    onChange={(e) => setDetallesAdicionales(e.target.value)}
                    className="p-2 rounded border w-full text-black"
                    placeholder="Agregar detalles adicionales"
                  />
                </div>
              </div>
            </div>
        
            {/* Items de la cotización */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Servicios/Productos Cotizados</h2>
              {serviceRows.map((row, index) => (
                <div key={index} className="border-t pt-4 mt-4 relative">
                  <h3 className="text-xl font-bold">Servicio {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="relative">
                      <label className="block">Descripción</label>
                      <input
                        type="text"
                        name="description"
                        value={row.description}
                        onChange={(e) => handleRowChange(index, e)}
                        className="p-2 rounded border w-full text-black"
                      />
                    </div>
                    <div>
                      <label className="block">Cantidad</label>
                      <input
                        type="number"
                        name="cantidad"
                        value={row.cantidad}
                        onChange={(e) => handleRowChange(index, e)}
                        className="p-2 rounded border w-full text-black"
                      />
                    </div>
                    <div>
                      <label className="block">Unidad</label>
                      <input
                        type="text"
                        name="um"
                        value={row.um}
                        onChange={(e) => handleRowChange(index, e)}
                        className="p-2 rounded border w-full text-black"
                      />
                    </div>
                    <div>
                      <label className="block">Precio Unitario</label>
                      <input
                        type="number"
                        name="pu"
                        value={row.pu}
                        onChange={(e) => handleRowChange(index, e)}
                        className="p-2 rounded border w-full text-black"
                      />
                    </div>
                    <div>
                      <label className="block">Total</label>
                      <input
                        type="number"
                        name="total"
                        value={row.total}
                        onChange={(e) => handleRowChange(index, e)}
                        className="p-2 rounded border w-full text-black"
                      />
                    </div>
                    <div>
                      <label className="block">Comentarios</label>
                      <textarea
                        name="comments"
                        value={row.comments}
                        onChange={(e) => handleRowChange(index, e)}
                        className="p-2 rounded border w-full text-black"
                      />
                    </div>
                    <button
                      type="button"
                      className="bg-red-500 text-white w-12 h-12 top-[5px]"
                      onClick={() => removeRow(index)}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="bg-green-500 text-white p-2 rounded"
                onClick={addRow}
              >
                Agregar Servicio
              </button>
            </div>
        
            {/* Botón para exportar a PDF */}
            <button
              type="button"
              className="bg-blue-500 text-white p-2 rounded"
              onClick={generatePDF}
            >
              Exportar a PDF
            </button>
          </form>
        </div>
  
  
  );
};

export default CreateQuote;
