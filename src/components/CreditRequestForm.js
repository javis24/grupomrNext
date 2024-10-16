import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CreditRequestForm = () => {
  const [formData, setFormData] = useState({
    nombreComercial: '',
    razonSocial: '',
    rfc: '',
    representanteLegal: '',
    calle: '',
    numero: '',
    colonia: '',
    ciudad: '',
    estado: '',
    cp: '',
    telefono1: '',
    telefono2: '',
    correo: '',
    giroComercial: '',
    fechaInicio: '',
    banco: '',
    numeroCuenta: '',
    sucursal: '',
    domicilioBanco: '',
    telefonoBanco: '',
    nombreGerente: '',
    cuentaDesde: '',
    saldoPromedio: '',
    personalAutorizado: Array(5).fill({ nombre: '', ine: '', firma: '' }), // Hasta 5 personas
    avalNombre: '',
    avalIne: '',
    avalFirma: '',
    avalDireccion: '',
    avalColonia: '',
    avalCp: '',
    avalTelefono: '',
    avalFax: '',
    avalCorreo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
  
    const imgUrl = '/logo_mr.png';  // Ruta relativa desde el directorio 'public'
    const image = new Image();
    image.src = imgUrl;
  
    image.onload = () => {
      // Añadir logo y encabezado
      doc.addImage(image, 'PNG', 10, 10, 40, 40);
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      doc.text("MRE040121UBA", 105, 27, { align: 'center' });
      doc.text("C Benito Juarez 112 sur, Col. Primero de Mayo, Cd. Lerdo, Dgo. C.P. 35169", 105, 44, { align: 'center' });
  
      // Encabezado de la solicitud
      doc.setFillColor(255, 204, 0); // Color amarillo
      doc.rect(50, 50, 110, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("MATERIALES REUTILIZABLES SA DE CV", 105, 57, null, 'center');
  
      // Cuadro para la fecha
      doc.setFontSize(12);
      doc.text("FECHA", 165, 57);
  
      // Bloque de información del cliente
      doc.setFontSize(12);
      const clientDetails = [
        ["NOMBRE COMERCIAL", formData.nombreComercial, "RAZÓN SOCIAL", formData.razonSocial],
        ["RFC", formData.rfc, "REPRESENTANTE LEGAL", formData.representanteLegal],
        ["CALLE", formData.calle, "NÚMERO", formData.numero],
        ["COLONIA", formData.colonia, "CIUDAD", formData.ciudad],
        ["ESTADO", formData.estado, "CP", formData.cp],
        ["TELÉFONO (1)", formData.telefono1, "TELÉFONO (2)", formData.telefono2],
        ["CORREO", formData.correo, "GIRO COMERCIAL", formData.giroComercial],
        ["FECHA INICIO DE ACT", formData.fechaInicio, "", ""]
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
          0: { cellWidth: 45 }, // Ajusta los tamaños de las columnas según el diseño
          1: { cellWidth: 65 },
          2: { cellWidth: 45 },
          3: { cellWidth: 65 },
        }
      });
  
      // Sección de contacto comercial
      doc.setFontSize(12);
      doc.text("CONTACTO COMERCIAL", 105, doc.lastAutoTable.finalY + 10, null, 'center');
      
      const contactDetails = [
        ["DEPARTAMENTO", "NOMBRE", "TEL / MOVIL", "CORREO"],
        ["COMPRAS", "", "", ""],
        ["PAGOS", "", "", ""],
        ["USUARIO/OPERACIÓN", "", "", ""],
        ["OTRO", "", "", ""]
      ];
  
      doc.autoTable({
        head: [contactDetails[0]],
        body: contactDetails.slice(1),
        startY: doc.lastAutoTable.finalY + 15,
        theme: 'grid',
        headStyles: { fillColor: [255, 204, 0] },
        styles: {
          fontSize: 8,
          halign: 'center',
        }
      });
  
      // Sección de referencias comerciales
      doc.setFontSize(12);
      doc.text("REFERENCIAS COMERCIALES", 105, doc.lastAutoTable.finalY + 10, null, 'center');
      
      const referencesDetails = [
        ["NOMBRE DE LA EMPRESA", "CONTACTO", "DOMICILIO", "TELÉFONO", "MONTO DE CRÉDITO", "ANTIGÜEDAD"],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""]
      ];
  
      doc.autoTable({
        head: [referencesDetails[0]],
        body: referencesDetails.slice(1),
        startY: doc.lastAutoTable.finalY + 15,
        theme: 'grid',
        headStyles: { fillColor: [255, 204, 0] },
        styles: {
          fontSize: 8,
          halign: 'center',
        }
      });
  
      // Guardar el archivo PDF
      doc.save('solicitud_credito.pdf');
    };
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Solicitud de Crédito</h1>
      <form className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-white-700">Nombre Comercial</label>
          <input
            type="text"
            name="nombreComercial"
            value={formData.nombreComercial}
            onChange={handleChange}
            className="mt-1 p-2 border border-black-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Razón Social</label>
          <input
            type="text"
            name="razonSocial"
            value={formData.razonSocial}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">RFC</label>
          <input
            type="text"
            name="rfc"
            value={formData.rfc}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Representante Legal</label>
          <input
            type="text"
            name="representanteLegal"
            value={formData.representanteLegal}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Calle</label>
          <input
            type="text"
            name="calle"
            value={formData.calle}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Número</label>
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Colonia</label>
          <input
            type="text"
            name="colonia"
            value={formData.colonia}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Ciudad</label>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Estado</label>
          <input
            type="text"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Código Postal</label>
          <input
            type="text"
            name="cp"
            value={formData.cp}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Teléfono (1)</label>
          <input
            type="tel"
            name="telefono1"
            value={formData.telefono1}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Teléfono (2)</label>
          <input
            type="tel"
            name="telefono2"
            value={formData.telefono2}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Correo</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Giro Comercial</label>
          <input
            type="text"
            name="giroComercial"
            value={formData.giroComercial}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>

        <div>
          <label className="block text-white-700">Fecha de Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleChange}
            className="mt-1 p-2 border border-white-300 rounded w-full text-black"
          />
        </div>
        <div>
          <label className="block">Banco</label>
          <input
            type="text"
            name="banco"
            value={formData.banco}
            onChange={handleChange}
            className="p-2 rounded border"
          />
        </div>
        <div>
          <label className="block">Número de Cuenta</label>
          <input
            type="text"
            name="numeroCuenta"
            value={formData.numeroCuenta}
            onChange={handleChange}
            className="p-2 rounded border"
          />
        </div>
        <div>
          <label className="block">Sucursal</label>
          <input
            type="text"
            name="sucursal"
            value={formData.sucursal}
            onChange={handleChange}
            className="p-2 rounded border"
          />
        </div>

        {/* Más campos como domicilio, teléfono, etc. */}
        {/* Sección de personal autorizado */}
        {formData.personalAutorizado.map((autorizado, index) => (
          <div key={index} className="col-span-3">
            <label className="block">Nombre del Personal Autorizado {index + 1}</label>
            <input
              type="text"
              name={`nombre${index}`}
              value={autorizado.nombre}
              onChange={(e) => handlePersonalAutorizadoChange(index, 'nombre', e.target.value)}
              className="p-2 rounded border w-full"
            />
          </div>
        ))}

        {/* Campos de Aval */}
        <div>
          <label className="block">Nombre del Aval</label>
          <input
            type="text"
            name="avalNombre"
            value={formData.avalNombre}
            onChange={handleChange}
            className="p-2 rounded border"
          />
        </div>

        <button
          type="button"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={exportToPDF}
        >
          Exportar a PDF
        </button>
      </form>
    </div>
  );
};

export default CreditRequestForm;
