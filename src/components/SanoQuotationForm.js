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

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Logo del encabezado
    const imgUrl = '/logo_sano.png';  // Ruta de tu logo
    const image = new Image();
    image.src = imgUrl;

    image.onload = () => {
      doc.addImage(image, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(11);
      doc.text("Soluciones Ambientales Normativas SA de CV", 105, 20, { align: 'center' });
      doc.text("Av. Enrique Ibarra 719 Ote Col. San José, Cd. Lerdo, Dgo. C.P. 35168", 105, 27, { align: 'center' });

      // Título de la cotización
      doc.setFontSize(13);
      doc.text("COTIZACIÓN", 160, 47);

      // Fecha y No. Cotización
      doc.setFontSize(10);
      doc.rect(150, 55, 50, 15);
      doc.text("No: 01", 160, 63);
      doc.text(`Fecha: ${formData.fecha}`, 160, 70);

      // Información del cliente
      doc.setFontSize(10);
      doc.setFillColor(255, 204, 0);
      doc.rect(10, 80, 190, 10, 'F');
      doc.text("DATOS DEL CLIENTE O SOLICITANTE", 105, 87, null, 'center');

      const clientDetails = [
        ["EMPRESA", formData.empresa, "DOMICILIO", formData.domicilio],
        ["ATENCIÓN A", formData.atencionA, "TELÉFONO", formData.telefono],
        ["DEPARTAMENTO", formData.departamento, "MÓVIL", formData.movil],
        ["CORREO ELECTRÓNICO", formData.correoElectronico, "SUPERVISOR ASIGNADO", formData.supervisorAsignado],
      ];

      doc.autoTable({
        body: clientDetails,
        startY: 95,
        theme: 'plain',
        styles: { cellPadding: 2, fontSize: 8, halign: 'left' },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 }, 2: { cellWidth: 50 }, 3: { cellWidth: 50 } }
      });

      // Detalle de la cotización
      doc.setFontSize(10);
      doc.setFillColor(255, 204, 0);
      doc.rect(10, doc.lastAutoTable.finalY + 10, 190, 10, 'F');
      doc.text("DETALLE DE LA COTIZACIÓN", 105, doc.lastAutoTable.finalY + 17, null, 'center');

      const itemDetails = formData.items.map((item, index) => [
        index + 1,
        item.descripcion,
        item.cantidad,
        item.unidad,
        item.precioUnitario,
        item.total,
        item.comentarios
      ]);

      doc.autoTable({
        head: [["NO", "DESCRIPCIÓN", "CANTIDAD", "UNIDAD", "P.U.", "TOTAL", "COMENTARIOS"]],
        body: itemDetails,
        startY: doc.lastAutoTable.finalY + 20,
        theme: 'grid',
        headStyles: { fillColor: [255, 204, 0] },
        styles: { fontSize: 8, halign: 'center' },
        columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 50 }, 2: { cellWidth: 20 }, 3: { cellWidth: 20 }, 4: { cellWidth: 30 }, 5: { cellWidth: 30 }, 6: { cellWidth: 40 } }
      });

      // Guardar el archivo PDF
      doc.save('cotizacion_sano.pdf');
    };
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cotización SANO</h1>
      <form className="grid grid-cols-3 gap-6">
        {/* Campos de información del cliente */}
        <div>
          <label className="block">Empresa</label>
          <input
            type="text"
            name="empresa"
            value={formData.empresa}
            onChange={handleChange}
            className="p-2 rounded border text-black"
          />
        </div>
        <div>
          <label className="block">Domicilio</label>
          <input
            type="text"
            name="domicilio"
            value={formData.domicilio}
            onChange={handleChange}
            className="p-2 rounded border text-black"
          />
        </div>
        <div>
          <label className="block">Atención a</label>
          <input
            type="text"
            name="atencionA"
            value={formData.atencionA}
            onChange={handleChange}
            className="p-2 rounded border text-black"
          />
        </div>
        <div>
          <label className="block">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="p-2 rounded border text-black"
          />
        </div>
        <div>
          <label className="block">Móvil</label>
          <input
            type="text"
            name="movil"
            value={formData.movil}
            onChange={handleChange}
            className="p-2 rounded border text-black"
          />
        </div>
        <div>
          <label className="block">Departamento</label>
          <input
            type="text"
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            className="p-2 rounded border text-black"
          />
        </div>
        <div>
          <label className="block">Correo Electrónico</label>
          <input
            type="text"
            name="correoElectronico"
            value={formData.correoElectronico}
            onChange={handleChange}
            className="p-2 rounded border text-black"
          />
        </div>
        <div>
          <label className="block">Supervisor Asignado</label>
          <input
            type="text"
            name="supervisorAsignado"
            value={formData.supervisorAsignado}
            onChange={handleChange}
            className="p-2 rounded border text-black"
          />
        </div>
        <div>
          <label className="block">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="p-2 rounded border text-black"
          />
        </div>

        {/* Items de la cotización */}
                {/* Items de la cotización */}
          {formData.items.map((item, index) => (
            <div key={index} className="col-span-3 border-t pt-4 mt-4">
              <h3 className="text-xl font-bold">Servicios {index + 1}</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1 mr-2">
                    <label className="block">Descripción</label>
                    <input
                      type="text"
                      name="descripcion"
                      value={item.descripcion}
                      onChange={(e) => handleChange(e, index)}
                      className="p-2 rounded border w-full text-black"
                    />
                  </div>
                  <div className="flex-1 mr-2">
                    <label className="block">Cantidad</label>
                    <input
                      type="number"
                      name="cantidad"
                      value={item.cantidad}
                      onChange={(e) => handleChange(e, index)}
                      className="p-2 rounded border w-full text-black"
                    />
                  </div>
                  <div className="flex-1 mr-2">
                    <label className="block">Unidad</label>
                    <input
                      type="text"
                      name="unidad"
                      value={item.unidad}
                      onChange={(e) => handleChange(e, index)}
                      className="p-2 rounded border w-full text-black"
                    />
                  </div>
                  <div className="flex-1 mr-2">
                    <label className="block">Precio Unitario</label>
                    <input
                      type="number"
                      name="precioUnitario"
                      value={item.precioUnitario}
                      onChange={(e) => handleChange(e, index)}
                      className="p-2 rounded border w-full text-black"
                    />
                  </div>
                  <div className="flex-1 mr-2">
                    <label className="block">Total</label>
                    <input
                      type="number"
                      name="total"
                      value={item.total}
                      onChange={(e) => handleChange(e, index)}
                      className="p-2 rounded border w-full text-black"
                    />
                  </div>
                  <div className="flex-1 mr-2">
                    <label className="block">Comentarios</label>
                    <textarea
                      name="comentarios"
                      value={item.comentarios}
                      onChange={(e) => handleChange(e, index)}
                      className="p-2 rounded border w-full text-black"
                    />
                  </div>
                </div>
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
