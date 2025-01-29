import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import jwt from 'jsonwebtoken';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937',
    border: 'none',
    borderRadius: '8px',
    padding: '20px',
    maxHeight: '80vh', // Limita la altura del modal
    overflowY: 'auto',
  },
};

export default function SalesReportList() {
  const [salesReports, setSalesReports] = useState([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState(''); // Fecha de inicio del filtro
  const [endDate, setEndDate] = useState('');     // Fecha de fin del filtro
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [clienteProveedorProspecto, setClienteProveedorProspecto] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [unidadNegocio, setUnidadNegocio] = useState('');
  const [productoServicio, setProductoServicio] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [status, setStatus] = useState('');
  const [extraText, setExtraText] = useState('');
  const [detalles, setDetalles] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [reportsList, setReportsList] = useState([
    {
      clienteProveedorProspecto: '',
      empresa: '',
      unidadNegocio: '',
      productoServicio: '',
      comentarios: '',
      status: '',
      extraText: '',
      image: null,
      imageUrl: '',
    },
  ]);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  // Cantidad de reportes por página
const REPORTS_PER_PAGE = 5; // Ajusta según lo que necesites

// Estado que controla la página actual
const [currentPage, setCurrentPage] = useState(1);

const handleImageChange = (index, e) => {
    const updatedReportsList = [...reportsList];
    const selectedImage = e.target.files[0];
    updatedReportsList[index].image = selectedImage;
    updatedReportsList[index].imageUrl = selectedImage ? URL.createObjectURL(selectedImage) : ''; // Actualizar la vista previa específica
    setReportsList(updatedReportsList);
  };

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwt.decode(token);
        setUserId(decoded.id);
      }
      fetchSalesReports();
    }, []);

    const fetchSalesReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/sales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Response data:", response.data); // Verifica si cada reporte contiene el campo User con name
        setSalesReports(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching sales reports:', error);
        setError('Failed to load sales reports. Please try again later.');
      }
    };

    const handleDelete = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/sales/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesReports(salesReports.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Error deleting sales report:', error);
      setError('Failed to delete sales report. Please try again.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!selectedReport || !selectedReport.id) {
        setError('No report selected for update');
        return;
      }
  
      const updatedReportData = reportsList[0];
  
      // Crear `FormData` para enviar datos y archivos
      const formData = new FormData();
      formData.append('clienteProveedorProspecto', String(updatedReportData.clienteProveedorProspecto));
      formData.append('empresa', String(updatedReportData.empresa));
      formData.append('unidadNegocio', String(updatedReportData.unidadNegocio));
      formData.append('productoServicio', String(updatedReportData.productoServicio));
      formData.append('comentarios', String(updatedReportData.comentarios || ''));
      formData.append('status', String(updatedReportData.status));
      formData.append('extraText', String(updatedReportData.extraText || ''));
  
      // Agrega la imagen seleccionada o la URL de la imagen existente
      if (image) {
        formData.append('image', image);
      } else {
        formData.append('imageUrl', imageUrl);
      }
  
      await axios.put(`/api/sales/${selectedReport.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Actualiza el estado de `salesReports` para reflejar los cambios
      const updatedReports = salesReports.map(report =>
        report.id === selectedReport.id
          ? { ...report, ...updatedReportData, imageUrl } // Incluye `imageUrl` actualizado
          : report
      );
      setSalesReports(updatedReports);
      closeModal();
    } catch (error) {
      console.error('Error updating sales report:', error);
      setError('Failed to update sales report. Please try again.');
    }
  };
  
  

  const handleAddService = () => {
    setReportsList([...reportsList, {
      clienteProveedorProspecto: '',
      empresa: '',
      unidadNegocio: '',
      productoServicio: '',
      comentarios: '',
      status: '',
      extraText: '',
      image: null,
        imageUrl: '',
    }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedReportsList = [...reportsList];
    updatedReportsList[index][field] = value;
    setReportsList(updatedReportsList);
  };
  


  const handleSaveReport = async () => {
    try {
      const token = localStorage.getItem('token');
      for (let report of reportsList) {
        const formData = new FormData();
        formData.append('clienteProveedorProspecto', String(report.clienteProveedorProspecto));
        formData.append('empresa', String(report.empresa));
        formData.append('unidadNegocio', String(report.unidadNegocio));
        formData.append('productoServicio', String(report.productoServicio));
        formData.append('comentarios', String(report.comentarios || ''));
        formData.append('status', String(report.status));
        formData.append('extraText', String(report.extraText || ''));
        
        // Adjuntar la imagen solo si existe
        if (report.image) {
          formData.append('image', report.image);
        }
  
        await axios.post('/api/sales/', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }
  
      fetchSalesReports(); // Recargar la lista de reportes después de guardar
      closeModal(); // Cerrar el modal
    } catch (error) {
      console.error('Error saving reports:', error.response ? error.response.data : error.message);
      setError('Failed to save reports. Please try again.');
    }
  };
  
  
  const openModal = (report = null) => {
    setSelectedReport(report);
    if (report) {
      // Llenamos `reportsList` con los datos del reporte seleccionado para editar
      setReportsList([{
        clienteProveedorProspecto: report.clienteProveedorProspecto || '',
        empresa: report.empresa || '',
        unidadNegocio: report.unidadNegocio || '',
        productoServicio: report.productoServicio || '',
        comentarios: report.comentarios || '',
        status: report.status || '',
        extraText: report.extraText || '',
        image: null,
          imageUrl: report.imageUrl || '',
        
      }]);
      
      // Aseguramos que `imageUrl` se establezca correctamente para edición
      setImageUrl(report.imageUrl ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${report.imageUrl}` : '');
    } else {
      // Limpiamos `imageUrl` y `reportsList` para un nuevo reporte
      setImageUrl('');
      setReportsList([{
        clienteProveedorProspecto: '',
        empresa: '',
        unidadNegocio: '',
        productoServicio: '',
        comentarios: '',
        status: '',
        extraText: '',
        image: null,
        imageUrl: '',
      }]);
    }
    setModalIsOpen(true);
  };
  
  
  

  const clearForm = () => {
    setReportsList([{
      clienteProveedorProspecto: '',
      empresa: '',
      unidadNegocio: '',
      productoServicio: '',
      comentarios: '',
      status: '',
      extraText: '',
      setImageUrl:'', // Limpia la URL de la imagen al cerrar el modal
      setImage: (null),
      
    }]);
    setSelectedReport(null);
  };
  

  const closeModal = () => {
    setModalIsOpen(false);
    setReportsList([
      {
        clienteProveedorProspecto: '',
        empresa: '',
        unidadNegocio: '',
        productoServicio: '',
        comentarios: '',
        status: '',
        extraText: '',
        image: null,
        imageUrl: '',
    
      },
    ]);
  };


  const handleRemoveService = (index) => {
    const updatedReportsList = reportsList.filter((_, i) => i !== index);
    setReportsList(updatedReportsList);
  };
  
  

  const filteredReports = salesReports.filter((report) => {
    // Convertimos el texto de búsqueda a minúsculas
    const text = search.toLowerCase();
  
    // matchesSearch será true si el texto aparece en clienteProveedorProspecto O en empresa
    const matchesSearch =
      report.clienteProveedorProspecto?.toLowerCase().includes(text) ||
      report.empresa?.toLowerCase().includes(text);
  
    const matchesDate =
      (!startDate || new Date(report.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(report.createdAt) <= new Date(endDate));
  
    return matchesSearch && matchesDate;
  });
  
  

// Cálculo para la paginación
const indexOfLastReport = currentPage * REPORTS_PER_PAGE;
const indexOfFirstReport = indexOfLastReport - REPORTS_PER_PAGE;

// Este es el slice de reportes que se va a mostrar en la tabla
const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

// Cantidad total de páginas
const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE);





  const exportReportToPDF = (report) => {
    const doc = new jsPDF();
    const imgUrl = '/logo_mr.png';
    const userName = report.User && report.User.name ? report.User.name : "Desconocido"; // Verifica que report.User y report.User.name existen
  
    const image = new Image();
    image.src = imgUrl;
  
    image.onload = () => {
      doc.addImage(image, 'PNG', 20, 10, 20, 20);
  
      // Información de la empresa
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, 27, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, 32, { align: 'center' });
      doc.text("MRE040121UBA", 105, 37, { align: 'center' });
      doc.text(`Creado por: ${userName}`, 105, 44, { align: 'center' });
  
      // Datos del reporte
      const reportDetails = [
        ["Cliente/Proveedor/Prospecto", report.clienteProveedorProspecto],
        ["Empresa", report.empresa],
        ["Unidad de Negocio", report.unidadNegocio],
        ["Producto/Servicio", report.productoServicio],
        ["Comentarios", report.comentarios],
        ["Status", report.status],
        ["ExtraText", report.extraText],
      ];
  
      doc.autoTable({
        body: reportDetails,
        startY: 50,
        theme: 'plain',
        styles: { cellPadding: 1, fontSize: 10, lineWidth: 0.1 },
        columnStyles: {
          0: { halign: 'left', textColor: [0, 0, 0], cellWidth: 60 },
          1: { halign: 'left', textColor: [0, 0, 0], cellWidth: 100 },
        }
      });
  
      doc.save(`Reporte_${report.clienteProveedorProspecto}.pdf`);
    };
  };
  
  const exportAllReportsToPDF = () => { 
    const doc = new jsPDF();
    const imgUrl = '/logo_mr.png';  
    let currentY = 10;  
  
    const image = new Image();
    image.src = imgUrl;
  
    image.onload = () => {
      doc.addImage(image, 'PNG', 20, 10, 20, 20);
      
      doc.setFontSize(12);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, currentY + 10, { align: 'center' });
      doc.text("Benito Juarez 112 SUR, Col. 1ro de Mayo", 105, currentY + 17, { align: 'center' });
      doc.text("Cd. Lerdo, Dgo. C.P. 35169", 105, currentY + 22, { align: 'center' });
      doc.text("MRE040121UBA", 105, currentY + 27, { align: 'center' });
  
      salesReports.forEach((report, index) => {
        const userName = report.User && report.User.name ? report.User.name : "Desconocido"; // Verifica `User` y `name`
  
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Reporte ${index + 1}`, 20, currentY + 40);
        doc.text(`Creado por: ${userName}`, 105, currentY + 32, { align: 'center' });
  
        const formattedDate = new Date(report.createdAt).toLocaleDateString();
        doc.setFontSize(10);
        doc.text(`Fecha de creación: ${formattedDate}`, 180, currentY + 40, null, 'center');
  
        const reportDetails = [
          ["Cliente/Proveedor/Prospecto", report.clienteProveedorProspecto],
          ["Empresa", report.empresa],
          ["Unidad de Negocio", report.unidadNegocio],
          ["Producto/Servicio", report.productoServicio],
          ["Comentarios", report.comentarios],
          ["Status", report.status],
          ["ExtraText", report.extraText],
        ];
  
        doc.autoTable({
          body: reportDetails,
          startY: currentY + 45,
          theme: 'plain',
          styles: { cellPadding: 1, fontSize: 12, lineWidth: 0.1 },
          columnStyles: {
            0: { halign: 'left', textColor: [0, 0, 0], cellWidth: 60 },
            1: { halign: 'left', textColor: [0, 0, 0], cellWidth: 100 },
          },
        });
  
        currentY = doc.lastAutoTable.finalY + 5;
      });
  
      doc.save('todos_los_reportes.pdf');
    };
  };
  
  return (
    <div className="p-4 bg-[#0e1624] text-white min-h-screen flex justify-center">
      <div className="max-w-7xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Reportes de Ventas</h1>
          <button onClick={() => openModal()} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Agregar nuevo reporte
          </button>
          <button onClick={exportAllReportsToPDF} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Exportar todos a PDF
          </button>
        </div>

        {/* Filtros de búsqueda y fecha */}
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Buscar un reporte"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 p-2 rounded bg-[#1f2937] text-white"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 rounded bg-[#1f2937] text-white"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 rounded bg-[#1f2937] text-white"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full table-auto bg-[#1f2937] text-left rounded-lg">
            <thead>
              <tr>
                <th className="px-2 py-2">Cliente/Proveedor/Prospecto</th>
                <th className="px-2 py-2">Empresa</th>
                <th className="px-2 py-2">Unidad de Negocio</th>
                <th className="px-2 py-2">Producto/Servicio</th>
                <th className="px-2 py-2">Comentarios</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentReports.map((report) => (
                <tr key={report.id} className="hover:bg-[#374151]">
                  <td className="px-4 py-2">{report.clienteProveedorProspecto}</td>
                  <td className="px-4 py-2">{report.empresa}</td>
                  <td className="px-4 py-2">{report.unidadNegocio}</td>
                  <td className="px-4 py-2">{report.productoServicio}</td>
                  <td className="px-4 py-2">{report.comentarios}</td>
                  <td className="px-4 py-2">{report.status}</td>
                  <td className="px-4 py-2">
                  <button onClick={() => openModal(report)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">
                      Ver..
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      Elim..
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel={selectedReport ? "Actualizar Reporte" : "Agregar Reporte"}
        >
          <h2 className="text-2xl font-bold mb-4 text-white">
            {selectedReport ? "Actualizar Reporte" : "Agregar Nuevos Reportess"}
          </h2>

          {/* Mapea cada servicio en `reportsList` para que aparezca un formulario por cada uno */}
          {reportsList.map((report, index) => (
          <form 
          key={index}
          onSubmit={(e) => handleCreateAndContinue(e, index)} className="mb-4 p-4 border rounded-lg bg-[#374151] relative">
             {/* Botón de eliminación para el reporte adicional */}
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="absolute top-2 right-2 text-red-500 font-bold text-2xl bg-transparent hover:text-red-700"
                  title="Eliminar este reporte"
                  style={{ lineHeight: '1', padding: '0', margin: '0' }}
                >
                  &times;
                </button>
              )}
          <div className="grid grid-cols-2 gap-4">
          <select
                value={report.clienteProveedorProspecto}
                onChange={(e) => handleInputChange(index, 'clienteProveedorProspecto', e.target.value)}
                className="w-full p-2 rounded bg-[#1f2937] text-white"
                required
              >
              <option value="">Clientess / Proveedor / Prospecto</option>
              <option value="acopio">Acopio</option>
              <option value="cliente">Cliente</option>
              <option value="proveedor">Proveedor</option>
              <option value="prospecto">Prospecto</option>
            </select>
            <input
              type="text"
              placeholder="Empresa"
              value={reportsList[index].empresa} // Cambia aquí para usar el valor correcto
              onChange={(e) => handleInputChange(index, 'empresa', e.target.value)} // Asegúrate de que esté usando handleInputChange
              className="w-full p-2 rounded bg-[#1f2937] text-white"
              required
          />
            <select
              value={reportsList[index].unidadNegocio} // Vinculamos al estado correspondiente
              onChange={(e) => handleInputChange(index, 'unidadNegocio', e.target.value)} // Usamos handleInputChange
              className="w-full p-2 rounded bg-[#1f2937] text-white"
              required
            >
              <option value="">Unidad de Negocio</option>
              <option value="empaques">Empaques</option>
              <option value="tarimas">Tarimas</option>
              <option value="servicios">Servicios</option>
              <option value="plasticos">Plásticos</option>
              <option value="sano">Sano</option>
              <option value="alimentos">Alimentos</option>
              <option value="composta">Composta</option>
              <option value="admon">Admon</option>
            </select>
            <input
              type="text"
              placeholder="Producto / Servicio"
              value={reportsList[index].productoServicio}
              onChange={(e) => handleInputChange(index, 'productoServicio', e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
              required
            />
            <textarea
              placeholder="Comentarios"
              value={reportsList[index].comentarios} // Vinculamos al estado correspondiente
              onChange={(e) => handleInputChange(index, 'comentarios', e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
            />
            <input
              type="text"
              placeholder="Status"
              value={reportsList[index].status} // Vinculamos al estado correspondiente
              onChange={(e) => handleInputChange(index, 'status', e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
            />
            <textarea
              placeholder="Texto Extra"
              value={reportsList[index].extraText} // Vinculamos al estado correspondiente
              onChange={(e) => handleInputChange(index, 'extraText', e.target.value)} // Usamos handleInputChange
              className="w-full p-2 rounded bg-[#1f2937] text-white"
            />
          {imageUrl && !image && (
              <div className="mb-4">
                <p>Imagen actual:</p>
                <img src={imageUrl} alt="Imagen del reporte" className="w-32 h-32 object-cover rounded" />
              </div>
            )}

            {/* Permitir seleccionar una nueva imagen y mostrar la vista previa específica */}
            <div className="mb-4">
                  <label htmlFor={`imageUpload-${index}`} className="block text-white">Subir una nueva imagen</label>
                  <input
                    type="file"
                    id={`imageUpload-${index}`}
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e)} // Pasar el índice para actualizar el reporte específico
                    className="block w-full text-white"
                  />
                </div>

                {report.imageUrl && (
                  <div className="mb-4">
                    <p>Vista previa de la nueva imagen:</p>
                    <img src={report.imageUrl} alt="Imagen seleccionada" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
          </div>
          {selectedReport && (
            <button
              type="button"
              onClick={() => exportReportToPDF(selectedReport)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-4 ml-2"
            >
              Exportar a PDF
            </button>
          )}
        </form>
        ))}
          <button
            type="button"
            onClick={handleAddService}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mt-4"
          >
            Añadir otro servicio
          </button>

          <button
            onClick={handleSaveReport}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-4 ml-2"
          >
            Guardar Reporte
          </button>

        <button onClick={closeModal} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Cerrar
        </button>
      </Modal>

      </div>
    </div>
  );
}
