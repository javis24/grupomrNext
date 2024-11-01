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
      detalles: '',
    },
  ]);

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
      
      await axios.put(`/api/sales/${selectedReport.id}`, {
        clienteProveedorProspecto,
        empresa,
        unidadNegocio,
        productoServicio,
        comentarios,
        status,
        extraText,
        detalles,
        userId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
     
      const updatedReports = salesReports.map(report => 
        report.id === selectedReport.id 
          ? { ...report, clienteProveedorProspecto, empresa, unidadNegocio, productoServicio, comentarios, status, extraText, detalles } 
          : report
      );
      setSalesReports(updatedReports);
      closeModal();
    } catch (error) {
      console.error('Error updating sales report:', error);
      setError('Failed to update sales report. Please try again.');
    }
  };

  const handleCreateAndContinue = async (e, index) => {
    e.preventDefault();
    const reportData = reportsList[index];
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/sales/',
        { ...reportData, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSalesReports();

      // Agregar un nuevo formulario vacío para continuar creando reportes
      setReportsList([
        ...reportsList,
        {
          clienteProveedorProspecto: '',
          empresa: '',
          unidadNegocio: '',
          productoServicio: '',
          comentarios: '',
          status: '',
          extraText: '',
          detalles: '',
        },
      ]);
    } catch (error) {
      console.error('Error creating sales report:', error);
      setError('Failed to create sales report. Please try again.');
    }
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
        await axios.post('/api/sales/', {
          ...report,
          userId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchSalesReports(); // Recargar la lista de reportes después de guardar
      closeModal(); // Cerrar el modal
    } catch (error) {
      console.error('Error saving reports:', error);
      setError('Failed to save reports. Please try again.');
    }
  };
  

  const openModal = (report = null) => {
    setSelectedReport(report);
    if (report) {
      setClienteProveedorProspecto(report.clienteProveedorProspecto);
      setEmpresa(report.empresa);
      setUnidadNegocio(report.unidadNegocio);
      setProductoServicio(report.productoServicio);
      setComentarios(report.comentarios);
      setStatus(report.status);
      setExtraText(report.extraText);
      setDetalles(report.detalles);
      setUserId(report.userId);      
    } else {
      clearForm();
    }
    setModalIsOpen(true);
  };

  const clearForm = () => {
    setClienteProveedorProspecto('');
    setEmpresa('');
    setUnidadNegocio('');
    setProductoServicio('');
    setComentarios('');
    setStatus('');
    setExtraText('');
    setDetalles('');
    setUserId('');
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
        detalles: '',
      },
    ]);
  };
  

  const filteredReports = salesReports.filter((report) => {
    const matchesSearch = report.clienteProveedorProspecto?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = (!startDate || new Date(report.createdAt) >= new Date(startDate)) &&
                        (!endDate || new Date(report.createdAt) <= new Date(endDate));
    return matchesSearch && matchesDate;
  });
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
              {filteredReports.map((report) => (
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
          {selectedReport ? "Actualizar Reporte" : "Agregar Nuevos Reportes"}
        </h2>

        <form onSubmit={selectedReport ? handleUpdate : (e) => handleCreateAndContinue(e, reportsList.length - 1)} className="mb-4 p-4 border rounded-lg bg-[#374151]">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={clienteProveedorProspecto}
              onChange={(e) => setClienteProveedorProspecto(e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
              required
            >
              <option value="">Cliente / Proveedor / Prospecto</option>
              <option value="acopio">Acopio</option>
              <option value="cliente">Cliente</option>
              <option value="proveedor">Proveedor</option>
              <option value="prospecto">Prospecto</option>
            </select>
            <input
              type="text"
              placeholder="Empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
              required
            />
            <select
              value={unidadNegocio}
              onChange={(e) => setUnidadNegocio(e.target.value)}
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
            <select
              value={productoServicio}
              onChange={(e) => setProductoServicio(e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
              required
            >
              <option value="">Producto / Servicio</option>
              {/* Opciones de producto/servicio */}
              <option value="super_saco_usado">Super Saco Usado</option>
              <option value="recoleccion_basura_comun">Recolección de Basura Común</option>
              {/* Agrega más opciones según sea necesario */}
            </select>
            <textarea
              placeholder="Comentarios"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
            />
            <input
              type="text"
              placeholder="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
            />
            <textarea
              placeholder="Texto Extra"
              value={extraText}
              onChange={(e) => setExtraText(e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
            />
            <textarea
              placeholder="Detalles"
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              className="w-full p-2 rounded bg-[#1f2937] text-white"
            />
          </div>

          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mt-4"
          >
            {selectedReport ? "Actualizar Reporte" : "Agregar y Continuar"}
          </button>
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

        <button onClick={closeModal} className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Cerrar
        </button>
      </Modal>

      </div>
    </div>
  );
}
