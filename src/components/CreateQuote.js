import { useEffect, useState } from 'react'; 
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CreateQuote = () => {
  const [quoteNumber, setQuoteNumber] = useState(0);
  const [currentDate, setCurrentDate] = useState("");

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
    assigned: ''
  });

  // Estado para manejar filas dinámicas en la tabla de servicios
  const [serviceRows, setServiceRows] = useState([
    { description: '', um: 'Pieza', pu: '', comments: '' }
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
        startY: 70,
        theme: 'plain',
        styles: {
          cellPadding: 2,
          fontSize: 8,
        },
        columnStyles: {
          0: { halign: 'left', textColor: [0, 0, 0] },
          1: { halign: 'right', textColor: [0, 0, 0] },
        }
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

      // Sección de observaciones
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(255, 204, 0);
      doc.rect(14, doc.lastAutoTable.finalY + 20, 182, 10, 'F');
      doc.text("OBSERVACIONES", 105, doc.lastAutoTable.finalY + 27, null, 'center');

      const observations = [
        "Precios más IVA",
        "Condiciones de pago: Negociable",
        "Contamos con todos los permisos necesarios para el desarrollo de nuestras actividades ante la SRNMA y SEMARNART",
        "NÚMERO DE AUTORIZACIÓN AMBIENTAL RERET-1-SRNMA-005-24",
        "Nuestro personal cuenta con seguridad social, EPP y capacitación para realizar las maniobras necesarias",
        "Esta Cotización tiene una vigencia de 15 días",
        "Teléfono de atención: 871-342 81 05"
      ];

      // Centrar las observaciones
      observations.forEach((obs, index) => {
        const obsTextWidth = doc.getTextWidth(obs);
        doc.text(105 - (obsTextWidth / 2), doc.lastAutoTable.finalY + 37 + (index * 6), obs);
      });

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
    <div className="p-8 bg-[#0e1624] text-white">
      <h2 className="text-2xl font-bold mb-4"> Cotización MR</h2>

      {/* Formulario para ingresar datos del cliente */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-2">Empresa</label>
          <input
            type="text"
            name="companyName"
            value={clientData.companyName}
            onChange={handleClientInputChange}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Domicilio</label>
          <input
            type="text"
            name="address"
            value={clientData.address}
            onChange={handleClientInputChange}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Atención a</label>
          <input
            type="text"
            name="attentionTo"
            value={clientData.attentionTo}
            onChange={handleClientInputChange}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Departamento</label>
          <input
            type="text"
            name="department"
            value={clientData.department}
            onChange={handleClientInputChange}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Correo Electrónico</label>
          <input
            type="email"
            name="email"
            value={clientData.email}
            onChange={handleClientInputChange}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Teléfono</label>
          <input
            type="text"
            name="phone"
            value={clientData.phone}
            onChange={handleClientInputChange}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Móvil</label>
          <input
            type="text"
            name="mobile"
            value={clientData.mobile}
            onChange={handleClientInputChange}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Supervisor</label>
          <input
            type="text"
            name="supervisor"
            value={clientData.supervisor}
            onChange={handleClientInputChange}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>

        <div>
          <label className="block mb-2">Asignado</label>
          <input
            type="text"
            name="assigned"
            value={clientData.assigned}
            onChange={handleClientInputChange}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>
      </div>

      {/* Formulario dinámico para agregar servicios */}
      <h3 className="text-xl font-semibold mb-4">Servicios</h3>
      {serviceRows.map((row, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 mb-2">
          <input
            type="text"
            name="description"
            placeholder="Descripción"
            value={row.description}
            onChange={(e) => handleRowChange(index, e)}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
          <input
            type="text"
            name="um"
            placeholder="UM"
            value={row.um}
            onChange={(e) => handleRowChange(index, e)}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
          <input
            type="number"
            name="pu"
            placeholder="P.U."
            value={row.pu}
            onChange={(e) => handleRowChange(index, e)}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
          <input
            type="text"
            name="comments"
            placeholder="Comentarios"
            value={row.comments}
            onChange={(e) => handleRowChange(index, e)}
            className="p-2 rounded bg-[#374151] text-white w-full"
          />
        </div>
      ))}

      {/* Botón para agregar una nueva fila */}
      <button
        onClick={addRow}
        className="mb-4 p-2 bg-green-500 rounded text-white hover:bg-green-600"
      >
        Agregar Fila
      </button>

      {/* Botón para generar PDF */}
      <button
        onClick={generatePDF}
        className="p-2 bg-blue-500 rounded text-white hover:bg-blue-600"
      >
        Generar PDF
      </button>
    </div>
  );
};

export default CreateQuote;
