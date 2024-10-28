import React, { useState } from 'react'; 
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SanoQuotationForm = () => {
  const [formData, setFormData] = useState({
    empresa: '',
    domicilio: '',
    atencionA: '',
    telefono: '',
    movil: '',
    departamento: '',
    correoElectronico: '',
    supervisorAsignado: '',
    fecha: '',
    detalles: '',
    items: [
      { descripcion: '', cantidad: 1, unidad: '', precioUnitario: 0, total: 0, comentarios: '' }
    ],
  });

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const updatedItems = [...formData.items];
      updatedItems[index] = { ...updatedItems[index], [name]: value };
      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addNewItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { descripcion: '', cantidad: 1, unidad: '', precioUnitario: 0, total: 0, comentarios: '' }]
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };


  const exportToPDF = () => {
    const doc = new jsPDF();

    // Obtener la fecha actual
      const today = new Date();
      const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;


    // Logo del encabezado
    const imgUrl = '/logo_sano.png';  // Ruta de tu logo
    const image = new Image();
    image.src = imgUrl;

      image.onload = () => {
      doc.addImage(image, 'PNG', 10, 5, 50, 50);
      
      // Información de la empresa y cotización en el encabezado
      doc.setFontSize(10);
      doc.text("Soluciones Ambientales Normativas SA de CV", 100, 20, { align: 'center' });
      doc.text("Av. Enrique Ibarra 719 Ote Col. San José", 100, 27, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35168", 100, 34, { align: 'center' });

      // Título de Cotización y Fecha
      doc.setFillColor(255, 178, 107); // Color naranja

      // Ajustar las coordenadas 'y' para mover las cajas más arriba
      doc.rect(150, 20, 50, 15, 'F'); // Caja para "Cotización", movida más arriba
      doc.rect(150, 40, 50, 15, 'F'); // Caja para "Fecha", movida más arriba

      // Ajustar el texto para que esté dentro de las cajas movidas
      doc.setFontSize(12);
      doc.text("COTIZACIÓN", 175, 28, { align: 'center' }); // Texto ajustado para "Cotización"
      doc.text("Nº 01", 175, 33, { align: 'center' }); // Texto ajustado para "Nº"
      doc.text(`Fecha: ${formattedDate}`, 175, 45, { align: 'center' });// Centrado ajustado

      // Información del cliente
      doc.setFontSize(10);
      doc.setFillColor(255, 178, 107); 
      doc.rect(10, 70, 190, 10, 'F'); // Barra de título "Datos del Cliente"
      doc.text("DATOS DEL CLIENTE O SOLICITANTE", 105, 77, null, 'center');

      const clientDetails = [
        ["EMPRESA", formData.empresa, "DOMICILIO", formData.domicilio],
        ["ATENCIÓN A", formData.atencionA, "TELÉFONO", formData.telefono],
        ["DEPARTAMENTO", formData.departamento, "MÓVIL", formData.movil],
        ["CORREO ELECTRÓNICO", formData.correoElectronico, "SUPERVISOR ASIGNADO", formData.supervisorAsignado],
      ];

      doc.autoTable({
        body: clientDetails,
        startY: 85,
        theme: 'plain',
        theme: 'grid',
        styles: { cellPadding: 2, fontSize: 8, halign: 'left'},
        columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 50 }, 2: { cellWidth: 50 }, 3: { cellWidth: 50 } },
        margin: { left: 10 }
      });

      // Detalle de la cotización
      doc.setFontSize(8);
      doc.setFillColor(255, 178, 107);
      doc.rect(10, doc.lastAutoTable.finalY + 10, 190, 10, 'F');
      doc.text("Estimado, con la presente nos permitimos realizarle la siguiente propuesta con respecto a el servicio de manejo integral de residuos peligrosos", 105, doc.lastAutoTable.finalY + 17, null, 'center');

      const itemDetails = formData.items.map((item, index) => [
        index + 1,
        item.descripcion,
        item.cantidad,
        item.unidad,
        `$${item.precioUnitario.toFixed(2)}`, // Formato con $ en precio unitario
        `$${item.total.toFixed(2)}`, 
        item.comentarios
      ]);

      doc.autoTable({
        head: [["NO", "DESCRIPCIÓN", "CANTIDAD", "UNIDAD", "P.U.", "TOTAL", "COMENTARIOS"]],
        body: itemDetails,
        startY: doc.lastAutoTable.finalY + 30,
        theme: 'grid',
        headStyles: { fillColor: [255, 178, 107] },
        styles: { fontSize: 8, halign: 'left' },
        margin: { left: 11 },
        columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 50 }, 2: { cellWidth: 20 }, 3: { cellWidth: 20 }, 4: { cellWidth: 20 }, 5: { cellWidth: 20 }, 6: { cellWidth: 50 } }
      });

       // Sección de Observaciones
          doc.setFontSize(12);
          doc.setFillColor(255, 178, 107); 
          doc.rect(10, doc.lastAutoTable.finalY + 20, 190, 10, 'F');
          doc.text("DETALLES ADICIONALES", 105, doc.lastAutoTable.finalY + 27, null, 'center');

           // Insertar los detalles que el usuario ingresó en el campo de detalles
          const detalles = formData.detalles || "No hay detalles adicionales.";
          doc.text(detalles, 105, doc.lastAutoTable.finalY + 35, { align: 'center' });

          // Información de contacto
          doc.setFontSize(8);
          doc.text("COMERCIALIZACIÓN SANO", 105, doc.lastAutoTable.finalY + 85, null, 'center');
      



      // Guardar el archivo PDF
      doc.save('cotizacion_sano.pdf');
    };
  };

  return (
    <div className="container mx-auto p-6">
  <h1 className="text-2xl font-bold mb-6">Cotización SANO</h1>
  <form className="grid grid-cols-1 gap-6">
    {/* Campos de información del cliente */}
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block">Empresa</label>
          <input
            type="text"
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
            className="p-2 rounded border w-full text-black"
          />
        </div>
        <div>
          <label className="block">Domicilio</label>
          <input
            type="text"
            name="domicilio"
            value={formData.domicilio}
            onChange={handleChange}
            className="p-2 rounded border w-full text-black"
          />
        </div>
        <div>
          <label className="block">Atención a</label>
          <input
            type="text"
            name="atencionA"
            value={formData.atencionA}
            onChange={handleChange}
            className="p-2 rounded border w-full text-black"
          />
        </div>
        <div>
          <label className="block">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="p-2 rounded border w-full text-black"
          />
        </div>
        <div>
          <label className="block">Móvil</label>
          <input
            type="text"
            name="movil"
            value={formData.movil}
            onChange={handleChange}
            className="p-2 rounded border w-full text-black"
          />
        </div>
        <div>
          <label className="block">Departamento</label>
          <input
            type="text"
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            className="p-2 rounded border w-full text-black"
          />
        </div>
        <div>
          <label className="block">Correo Electrónico</label>
          <input
            type="email"
            name="correoElectronico"
            value={formData.correoElectronico}
            onChange={handleChange}
            className="p-2 rounded border w-full text-black"
          />
        </div>
        <div>
          <label className="block">Supervisor Asignado</label>
          <input
            type="text"
            name="supervisorAsignado"
            value={formData.supervisorAsignado}
            onChange={handleChange}
            className="p-2 rounded border w-full text-black"
          />
        </div>
        <div>
          <label className="block">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="p-2 rounded border w-full text-black"
          />
        </div>
        <div className="mb-4">
              <label className="block">Detalles</label>
              <textarea
                name="detalles"
                value={formData.detalles}
                onChange={handleChange}
                className="p-2 rounded border w-full text-black"
                placeholder="Agregar detalles adicionales"
              />
            </div>
      </div>
    </div>

    {/* Items de la cotización */}
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Servicios Cotizados</h2>
      {formData.items.map((item, index) => (
        <div key={index} className="border-t pt-4 mt-4 relative">
          <h3 className="text-xl font-bold">Servicios {index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Aquí agregamos el botón para eliminar el servicio */}
            <div className="relative">
              <label className="block">Descripción</label>
              <input
                type="text"
                name="descripcion"
                value={item.descripcion}
                onChange={(e) => handleChange(e, index)}
                className="p-2 rounded border w-full text-black"
              />
            </div>
            <div>
              <label className="block">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={item.cantidad}
                onChange={(e) => handleChange(e, index)}
                className="p-2 rounded border w-full text-black"
              />
            </div>
            <div>
              <label className="block">Unidad</label>
              <input
                type="text"
                name="unidad"
                value={item.unidad}
                onChange={(e) => handleChange(e, index)}
                className="p-2 rounded border w-full text-black"
              />
            </div>
            <div>
              <label className="block">Precio Unitario</label>
              <input
                type="number"
                name="precioUnitario"
                value={item.precioUnitario}
                onChange={(e) => handleChange(e, index)}
                className="p-2 rounded border w-full text-black"
              /> 
            </div>
            <div>
              <label className="block">Total</label>
              <input
                type="number"
                name="total"
                value={item.total}
                onChange={(e) => handleChange(e, index)}
                className="p-2 rounded border w-full text-black"
              />
            </div>
            <div>
              <label className="block">Comentarios</label>
              <textarea
                name="comentarios"
                value={item.comentarios}
                onChange={(e) => handleChange(e, index)}
                className="p-2 rounded border w-full text-black"
              />
              
            </div>
            <button
                type="button"
                className="bg-red-500 text-whit w-12 h-12 top-[5px]"
                onClick={() => removeItem(index)}
              >
                X
              </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="bg-green-500 text-white p-2 rounded"
        onClick={addNewItem}
      >
        Agregar Servicio
      </button>
    </div>

    {/* Botón para exportar a PDF */}
    <button
      type="button"
      className="bg-blue-500 text-white p-2 rounded"
      onClick={exportToPDF}
    >
      Exportar a PDF
    </button>
  </form>
</div>

   
  );
};

export default SanoQuotationForm;
