import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';

const createInitialFormState = () => ({
    fecha: '',
    nombreComercial: '',
    razonSocial: '',
    rfc: '',
    representanteLegal: '',
    tipoPersona: '',
    calle: '',
    numero: '',
    colonia: '',
    ciudad: '',
    estado: '',
    cp: '',
    telefono1: '',
    telefono2: '',
    correo: '',
    giro: '',
    inicioActividades: '',
    contactos: {
        compras: { nombre: '', tel: '', correo: '' },
        pagos: { nombre: '', tel: '', correo: '' },
        contabilidad: { nombre: '', tel: '', correo: '' },
        operacion: { nombre: '', tel: '', correo: '' },
    },
    referenciasComerciales: [
        { empresa: '', contacto: '', domicilio: '', tel: '', monto: '', antiguedad: '' },
        { empresa: '', contacto: '', domicilio: '', tel: '', monto: '', antiguedad: '' },
    ],
    banco: {
        nombre: '',
        cuenta: '',
        sucursal: '',
        domicilio: '',
        tel: '',
        gerente: '',
        desde: '',
        saldo: '',
    },
    personalAutorizado: Array.from({ length: 5 }, () => ({ nombre: '', ine: '' })),
    aval: {
        nombre: '',
        direccion: '',
        colonia: '',
        cp: '',
        tel: '',
        fax: '',
        correo: '',
        ine: '',
    },
    facturacion: {
        metodo: '',
        cfdi: '',
        institucion: '',
        cuenta: '',
        domicilioRevision: '',
        diaPagos: '',
    },
    solicitud: {
        volumen: '',
        monto: '',
        limiteCredito: '',
        plazoPago: '',
        condiciones: '',
    },
    pagare: {
        no: '',
        buenoPor: '',
        lugar: '',
        dia: '',
        mes: '',
        anio: '',
        beneficiario: 'Materiales Reutilizables S.A. de C.V.',
        lugarPago: '',
        fechaPago: '',
        moneda: 'Pesos Mexicanos',
    },
    exclusivo: {
        fechaOtorgada: '',
        aprobado: false,
        rechazado: false,
        cantidad: '',
        recomendaciones: '',
        observaciones: '',
    },
});

const CreditRequestForm = () => {
    const [savedCredits, setSavedCredits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [formData, setFormData] = useState(createInitialFormState());

    const opcionesPlazoPago = [
        '5 días',
        '8 días',
        '15 días',
        '20 días',
        '30 días',
        '45 días',
        '60 días',
        '90 días',
        '120 días',
    ];

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);

        const observer = new MutationObserver(() => {
            setDarkMode(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        fetchCredits();
    }, []);

    const fetchCredits = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/credits', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSavedCredits(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error al cargar historial:', err);
            toast.error('Error al cargar historial');
        }
    };

    const handleChange = (path, value) => {
        const keys = path.split('.');

        setFormData((prev) => {
            const newData = { ...prev };
            let current = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...(current[keys[i]] || {}) };
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleAuthPersonChange = (index, field, value) => {
        const newArray = [...formData.personalAutorizado];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormData({ ...formData, personalAutorizado: newArray });
    };

    const normalizeLoadedData = (data) => {
        const base = createInitialFormState();

        return {
            ...base,
            ...data,
            contactos: {
                ...base.contactos,
                ...(data.contactos || {}),
            },
            solicitud: {
                ...base.solicitud,
                ...(data.solicitud || {}),
            },
            pagare: {
                ...base.pagare,
                ...(data.pagare || {}),
            },
            aval: {
                ...base.aval,
                ...(data.aval || {}),
            },
            facturacion: {
                ...base.facturacion,
                ...(data.facturacion || {}),
            },
            exclusivo: {
                ...base.exclusivo,
                ...(data.exclusivo || {}),
            },
            personalAutorizado: Array.isArray(data.personalAutorizado)
                ? data.personalAutorizado
                : base.personalAutorizado,
        };
    };

    const handleSave = async () => {
        if (!formData.nombreComercial || !formData.rfc) {
            return toast.error('Nombre comercial y RFC son obligatorios');
        }

        try {
            const token = localStorage.getItem('token');

            if (isEditing) {
                await axios.put(`/api/credits/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Solicitud actualizada');
            } else {
                await axios.post('/api/credits', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Solicitud guardada');
            }

            setFormData(createInitialFormState());
            setIsEditing(false);
            setEditingId(null);
            fetchCredits();
        } catch (err) {
            console.error('Error crédito:', err.response?.data || err);
            toast.error(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Error al procesar'
            );
        }
    };

    const loadForEdit = (credit) => {
        try {
            const dataToLoad =
                typeof credit.fullData === 'string'
                    ? JSON.parse(credit.fullData)
                    : credit.fullData;

            setFormData(normalizeLoadedData(dataToLoad || {}));
            setEditingId(credit.id);
            setIsEditing(true);

            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.info('Editando: ' + (dataToLoad?.nombreComercial || 'Solicitud'));
        } catch (e) {
            console.error(e);
            toast.error('Error al cargar datos');
        }
    };


        const loadImageAsBase64 = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();

        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
        return null;
    }
};

    const generatePDF = async (rawData = formData) => {
    const data = rawData.fullData
        ? typeof rawData.fullData === 'string'
            ? JSON.parse(rawData.fullData)
            : rawData.fullData
        : rawData;

    if (!data || !data.nombreComercial) {
        toast.error('No hay información suficiente para generar el PDF');
        return;
    }

    const doc = new jsPDF('p', 'mm', 'letter');

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const yellow = [255, 204, 0];
    const gray = [235, 235, 235];
    const black = [0, 0, 0];

    const titleStyle = {
        fillColor: gray,
        textColor: black,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 7,
        lineColor: black,
        lineWidth: 0.2,
    };

    const labelStyle = {
        fillColor: [245, 245, 245],
        textColor: black,
        fontStyle: 'bold',
        fontSize: 6.5,
        lineColor: black,
        lineWidth: 0.2,
    };

    const bodyStyle = {
        fontSize: 6.5,
        cellPadding: 1.5,
        lineColor: black,
        lineWidth: 0.2,
        textColor: black,
        valign: 'middle',
    };

    const safe = (value) => value || '';

    const formatCurrency = (value) => {
        const number = Number(value || 0);

        return `$${number.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const logo = await loadImageAsBase64('/logo_mr.png');

    // =========================
    // ENCABEZADO
    // =========================
    if (logo) {
        doc.addImage(logo, 'PNG', 12, 12, 28, 20);
    } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('GRUPO MR', 15, 22);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Grupo MR', pageWidth / 2, 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Materiales Reutilizables S.A. de C.V.', pageWidth / 2, 18, { align: 'center' });
    doc.text('MRE040121U8A', pageWidth / 2, 22, { align: 'center' });
    doc.text('C Benito Juárez 112 sur Col. Primero de Mayo, Cd. Lerdo, Dgo. CP. 35169', pageWidth / 2, 26, {
        align: 'center',
    });

    doc.autoTable({
        startY: 34,
        margin: { left: 55, right: 55 },
        theme: 'grid',
        styles: bodyStyle,
        headStyles: titleStyle,
        body: [
            [
                {
                    content: 'MATERIALES REUTILIZABLES SA DE CV',
                    styles: { halign: 'center', fontStyle: 'bold' },
                },
            ],
            [
                {
                    content: 'EMPRESA (INFORMACIÓN INTERNA)',
                    styles: { halign: 'center', fontStyle: 'bold' },
                },
            ],
        ],
    });

    doc.autoTable({
        startY: 34,
        margin: { left: 160 },
        tableWidth: 45,
        theme: 'grid',
        styles: bodyStyle,
        body: [
            [
                {
                    content: safe(data.nombreComercial).toUpperCase(),
                    styles: { halign: 'center', fontStyle: 'bold' },
                },
            ],
            [
                {
                    content: safe(data.fecha).toUpperCase(),
                    styles: { halign: 'center', fontStyle: 'bold' },
                },
            ],
        ],
    });

    // =========================
    // DATOS FISCALES
    // =========================
    doc.autoTable({
        startY: 62,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: bodyStyle,
        columnStyles: {
            0: { cellWidth: 48, fontStyle: 'bold', fillColor: [245, 245, 245] },
            1: { cellWidth: 148, halign: 'center' },
        },
        body: [
            ['NOMBRE COMERCIAL', safe(data.nombreComercial).toUpperCase()],
            ['RAZÓN SOCIAL', safe(data.razonSocial).toUpperCase()],
            ['RFC', safe(data.rfc).toUpperCase()],
            ['REPRESENTANTE LEGAL', safe(data.representanteLegal).toUpperCase()],
            ['TIPO DE PERSONA', safe(data.tipoPersona).toUpperCase()],
        ],
    });

    // =========================
    // DOMICILIO FISCAL
    // =========================
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 6,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: titleStyle,
        styles: bodyStyle,
        head: [[{ content: 'DOMICILIO FISCAL', colSpan: 6 }]],
        columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold', fillColor: [245, 245, 245] },
            1: { cellWidth: 80, halign: 'center' },
            2: { cellWidth: 24, fontStyle: 'bold', fillColor: [245, 245, 245], halign: 'center' },
            3: { cellWidth: 24, halign: 'center' },
            4: { cellWidth: 18, fontStyle: 'bold', fillColor: [245, 245, 245], halign: 'center' },
            5: { cellWidth: 20, halign: 'center' },
        },
        body: [
            [
                'CALLE',
                safe(data.calle).toUpperCase(),
                'NÚMERO',
                safe(data.numero).toUpperCase(),
                'CP',
                safe(data.cp).toUpperCase(),
            ],
            [
                'COLONIA',
                {
                    content: safe(data.colonia).toUpperCase(),
                    colSpan: 5,
                    styles: { halign: 'center' },
                },
            ],
            [
                'CIUDAD',
                {
                    content: safe(data.ciudad).toUpperCase(),
                    styles: { halign: 'center' },
                },
                'ESTADO',
                {
                    content: safe(data.estado).toUpperCase(),
                    colSpan: 3,
                    styles: { halign: 'center' },
                },
            ],
        ],
    });

    // =========================
    // TELÉFONOS / CORREO / GIRO
    // =========================
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 6,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: bodyStyle,
        columnStyles: {
            0: { cellWidth: 35, fontStyle: 'bold', fillColor: [245, 245, 245] },
            1: { cellWidth: 45, halign: 'center' },
            2: { cellWidth: 35, fontStyle: 'bold', fillColor: [245, 245, 245] },
            3: { cellWidth: 81, halign: 'center' },
        },
        body: [
            ['TELÉFONO (1)', safe(data.telefono1), 'TELÉFONO OFICINA', safe(data.telefono2)],
            ['CORREO', { content: safe(data.correo), colSpan: 3 }],
            ['GIRO COMERCIAL', safe(data.giro).toUpperCase(), 'FECHA INICIO DE OPERACIÓN', safe(data.inicioActividades)],
        ],
    });

    // =========================
    // CONTACTO COMERCIAL
    // =========================
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 6,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: titleStyle,
        styles: bodyStyle,
        head: [[{ content: 'CONTACTO COMERCIAL', colSpan: 4 }]],
        body: [
            [
                { content: 'DEPARTAMENTO', styles: labelStyle },
                { content: 'NOMBRE', styles: labelStyle },
                { content: 'TEL / MÓVIL', styles: labelStyle },
                { content: 'CORREO', styles: labelStyle },
            ],
            [
                'COMPRAS',
                safe(data.contactos?.compras?.nombre).toUpperCase(),
                safe(data.contactos?.compras?.tel),
                safe(data.contactos?.compras?.correo),
            ],
            [
                'PAGOS',
                safe(data.contactos?.pagos?.nombre).toUpperCase(),
                safe(data.contactos?.pagos?.tel),
                safe(data.contactos?.pagos?.correo),
            ],
            [
                'USUARIO / OPERACIÓN',
                safe(data.contactos?.operacion?.nombre).toUpperCase(),
                safe(data.contactos?.operacion?.tel),
                safe(data.contactos?.operacion?.correo),
            ],
            [
                'CONTABILIDAD',
                safe(data.contactos?.contabilidad?.nombre).toUpperCase(),
                safe(data.contactos?.contabilidad?.tel),
                safe(data.contactos?.contabilidad?.correo),
            ],
        ],
        columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold' },
            1: { cellWidth: 62 },
            2: { cellWidth: 38, halign: 'center' },
            3: { cellWidth: 51 },
        },
    });

    // =========================
    // REFERENCIAS COMERCIALES
    // =========================
    const referencias = data.referenciasComerciales || [];

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 6,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: titleStyle,
        styles: bodyStyle,
        head: [[{ content: 'REFERENCIAS COMERCIALES (PROVEEDOR)', colSpan: 3 }]],
        body: [
            [
                { content: 'CAMPO', styles: labelStyle },
                { content: 'REFERENCIA 1', styles: labelStyle },
                { content: 'REFERENCIA 2', styles: labelStyle },
            ],
            ['NOMBRE DE LA EMPRESA', safe(referencias[0]?.empresa), safe(referencias[1]?.empresa)],
            ['CONTACTO', safe(referencias[0]?.contacto), safe(referencias[1]?.contacto)],
            ['DOMICILIO', safe(referencias[0]?.domicilio), safe(referencias[1]?.domicilio)],
            ['TELÉFONO', safe(referencias[0]?.tel), safe(referencias[1]?.tel)],
            ['MONTO DE CRÉDITO', safe(referencias[0]?.monto), safe(referencias[1]?.monto)],
            ['ANTIGÜEDAD', safe(referencias[0]?.antiguedad), safe(referencias[1]?.antiguedad)],
        ],
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 73 },
            2: { cellWidth: 73 },
        },
    });

    // =========================
    // DATOS BANCARIOS
    // =========================
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 6,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: titleStyle,
        styles: bodyStyle,
        head: [[{ content: 'DATOS BANCARIOS (DE DONDE RECIBIREMOS PAGOS)', colSpan: 2 }]],
        body: [
            ['BANCO', safe(data.banco?.nombre).toUpperCase()],
            ['NÚMERO DE CUENTA', safe(data.banco?.cuenta)],
            ['SUCURSAL', safe(data.banco?.sucursal).toUpperCase()],
            ['DOMICILIO', safe(data.banco?.domicilio).toUpperCase()],
            ['TELÉFONO', safe(data.banco?.tel)],
        ],
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold', fillColor: [245, 245, 245] },
            1: { cellWidth: 146 },
        },
    });

    // =========================
    // CONDICIONES DE CRÉDITO
    // =========================
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 6,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: titleStyle,
        styles: bodyStyle,
        head: [[{ content: 'CONDICIONES DE CRÉDITO', colSpan: 4 }]],
        body: [
            [
                'LÍMITE DE CRÉDITO',
                formatCurrency(data.solicitud?.limiteCredito),
                'PLAZO DE PAGO',
                safe(data.solicitud?.plazoPago),
            ],
            [
                'CONDICIONES',
                {
                    content: safe(data.solicitud?.condiciones).toUpperCase(),
                    colSpan: 3,
                },
            ],
        ],
        columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold', fillColor: [245, 245, 245] },
            1: { cellWidth: 45 },
            2: { cellWidth: 45, fontStyle: 'bold', fillColor: [245, 245, 245] },
            3: { cellWidth: 61 },
        },
    });

    // =========================
    // PÁGINA 2 - FIRMAS
    // =========================
    doc.addPage();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
        'DECLARO QUE LOS DATOS ASENTADOS EN LA SOLICITUD SON VERÍDICOS Y AUTORIZO QUE LOS COMPRUEBE A SU ENTERA SATISFACCIÓN',
        pageWidth / 2,
        45,
        { align: 'center' }
    );

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(65, 78, 150, 78);

    doc.setFontSize(8);
    doc.text('NOMBRE Y FIRMA DEL REP. LEGAL', pageWidth / 2, 84, { align: 'center' });

   
 

    doc.autoTable({
        startY: 132,
        margin: { left: 18, right: 18 },
        theme: 'grid',
        styles: {
            fontSize: 7,
            cellPadding: 2,
            lineColor: black,
            lineWidth: 0.3,
            halign: 'center',
            valign: 'middle',
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: black,
            fontStyle: 'bold',
            lineColor: black,
            lineWidth: 0.3,
        },
        head: [[{ content: 'CAMPO LLENADO POR GRUPO MR', colSpan: 3 }]],
        body: [
            [
                { content: '\n\n\n', styles: { minCellHeight: 20 } },
                { content: '\n\n\n', styles: { minCellHeight: 20 } },
                { content: '\n\n\n', styles: { minCellHeight: 20 } },
            ],
            [
                { content: 'NOMBRE Y FIRMA DEL ASESOR', styles: { fontStyle: 'bold' } },
                { content: 'CRÉDITO Y COBRANZA', styles: { fontStyle: 'bold' } },
                { content: 'NOMBRE Y FIRMA DEPTO. COMERCIAL', styles: { fontStyle: 'bold' } },
            ],
        ],
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 60 },
            2: { cellWidth: 60 },
        },
    });

    doc.save(`SOLICITUD_${data.nombreComercial}.pdf`);
    toast.success('PDF exportado');
};

    const filteredCredits = savedCredits.filter((c) => {
        const nombre = c.nombreComercial || '';
        const rfc = c.rfc || '';

        return (
            nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rfc.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0e1624] text-gray-900 dark:text-white p-2 md:p-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
                <div className="bg-white dark:bg-[#1f2937] rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transition-colors duration-300">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-800 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-xl md:text-2xl font-black uppercase italic text-white">
                                {isEditing ? '📝 Editando' : '🚀 Nueva Solicitud'}
                            </h1>
                            <p className="text-blue-100 text-[10px] uppercase font-bold tracking-widest">
                                Solicitud de crédito
                            </p>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditingId(null);
                                        setFormData(createInitialFormState());
                                    }}
                                    className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all"
                                >
                                    Cancelar
                                </button>
                            )}

                            <button
                                onClick={() => generatePDF()}
                                className="flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all"
                            >
                                PDF Previo
                            </button>
                        </div>
                    </div>

                    <div className="p-4 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                            <InputField label="Fecha" type="date" value={formData.fecha} onChange={(v) => handleChange('fecha', v)} />
                            <InputField label="RFC" value={formData.rfc} onChange={(v) => handleChange('rfc', v)} />
                            <InputField label="Nombre Comercial" value={formData.nombreComercial} onChange={(v) => handleChange('nombreComercial', v)} />
                            <InputField label="Razón Social" value={formData.razonSocial} onChange={(v) => handleChange('razonSocial', v)} />
                            <SelectField
                                label="Tipo de Persona"
                                value={formData.tipoPersona}
                                onChange={(v) => handleChange('tipoPersona', v)}
                                options={['Persona física', 'Persona moral']}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-gray-200 dark:border-gray-800 pt-8">
                            <div className="space-y-6">
                                <h2 className="text-blue-600 dark:text-blue-400 font-black uppercase text-xs border-l-4 border-blue-500 pl-3">
                                    Ubicación y Legal
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Representante Legal" value={formData.representanteLegal} onChange={(v) => handleChange('representanteLegal', v)} />
                                    <InputField label="Giro" value={formData.giro} onChange={(v) => handleChange('giro', v)} />
                                    <InputField label="Calle" value={formData.calle} onChange={(v) => handleChange('calle', v)} />
                                    <InputField label="Número" value={formData.numero} onChange={(v) => handleChange('numero', v)} />
                                    <InputField label="Colonia" value={formData.colonia} onChange={(v) => handleChange('colonia', v)} />
                                    <InputField label="CP" value={formData.cp} onChange={(v) => handleChange('cp', v)} />
                                    <InputField label="Ciudad" value={formData.ciudad} onChange={(v) => handleChange('ciudad', v)} />
                                    <InputField label="Estado" value={formData.estado} onChange={(v) => handleChange('estado', v)} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-yellow-600 dark:text-yellow-500 font-black uppercase text-xs border-l-4 border-yellow-500 pl-3">
                                    Contactos
                                </h2>

                                <ContactRow label="Compras" data={formData.contactos.compras} onChange={(f, v) => handleChange(`contactos.compras.${f}`, v)} />
                                <ContactRow label="Pagos" data={formData.contactos.pagos} onChange={(f, v) => handleChange(`contactos.pagos.${f}`, v)} />
                                <ContactRow label="Operación" data={formData.contactos.operacion} onChange={(f, v) => handleChange(`contactos.operacion.${f}`, v)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-gray-200 dark:border-gray-800 pt-8">
                            <div className="bg-gray-50 dark:bg-[#0e1624]/30 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 transition-colors">
                                <h2 className="text-purple-600 dark:text-purple-400 font-black uppercase text-xs">
                                    Personal Autorizado
                                </h2>

                                {formData.personalAutorizado.map((p, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            placeholder="Nombre Completo"
                                            className="flex-1 bg-white dark:bg-[#1f2937] border border-gray-300 dark:border-gray-700 p-2 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            value={p.nombre || ''}
                                            onChange={(e) => handleAuthPersonChange(i, 'nombre', e.target.value)}
                                        />

                                        <input
                                            placeholder="INE"
                                            className="sm:w-32 bg-white dark:bg-[#1f2937] border border-gray-300 dark:border-gray-700 p-2 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            value={p.ine || ''}
                                            onChange={(e) => handleAuthPersonChange(i, 'ine', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gray-50 dark:bg-[#0e1624]/30 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 transition-colors">
                                <h2 className="text-red-600 dark:text-red-400 font-black uppercase text-xs">
                                    Aval Solidario
                                </h2>

                                <InputField label="Nombre del Aval" value={formData.aval.nombre} onChange={(v) => handleChange('aval.nombre', v)} />
                                <InputField label="Dirección Completa" value={formData.aval.direccion} onChange={(v) => handleChange('aval.direccion', v)} />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Teléfono" value={formData.aval.tel} onChange={(v) => handleChange('aval.tel', v)} />
                                    <InputField label="INE del Aval" value={formData.aval.ine} onChange={(v) => handleChange('aval.ine', v)} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-500/5 p-4 md:p-6 rounded-2xl border border-blue-200 dark:border-blue-500/20 space-y-4 transition-colors">
                            <h2 className="text-blue-600 dark:text-blue-400 font-black uppercase text-xs border-l-4 border-blue-500 pl-3">
                                Condiciones de Crédito
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <InputField
                                    label="Límite de Crédito $"
                                    type="number"
                                    value={formData.solicitud.limiteCredito}
                                    onChange={(v) => handleChange('solicitud.limiteCredito', v)}
                                />

                                <SelectField
                                    label="Plazo de Pago"
                                    value={formData.solicitud.plazoPago}
                                    onChange={(v) => handleChange('solicitud.plazoPago', v)}
                                    options={opcionesPlazoPago}
                                />

                                <InputField
                                    label="Condiciones"
                                    value={formData.solicitud.condiciones}
                                    onChange={(v) => handleChange('solicitud.condiciones', v)}
                                />
                            </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-500/5 p-4 md:p-6 rounded-2xl border-2 border-dashed border-yellow-300 dark:border-yellow-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 transition-colors">
                            <InputField label="Monto Pagaré $" value={formData.pagare.buenoPor} onChange={(v) => handleChange('pagare.buenoPor', v)} />
                            <InputField label="Lugar Expedición" value={formData.pagare.lugar} onChange={(v) => handleChange('pagare.lugar', v)} />
                            <InputField label="Fecha de Pago" type="date" value={formData.pagare.fechaPago} onChange={(v) => handleChange('pagare.fechaPago', v)} />
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all transform active:scale-95"
                        >
                            {isEditing ? 'Actualizar Registro' : 'Guardar Solicitud'}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-black uppercase text-blue-600 dark:text-blue-500">
                                Historial
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-[10px] tracking-widest font-bold">
                                GESTIONAR SOLICITUDES PREVIAS
                            </p>
                        </div>

                        <div className="relative w-full md:w-96">
                            <input
                                placeholder="Buscar por Nombre o RFC..."
                                className="w-full bg-white dark:bg-[#1f2937] border border-gray-300 dark:border-gray-700 rounded-2xl p-4 pl-12 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <span className="absolute left-4 top-4 opacity-30 text-xl">🔍</span>
                        </div>
                    </div>

                    {filteredCredits.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 italic text-sm border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            No hay solicitudes registradas.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {filteredCredits.map((credit) => (
                                <div
                                    key={credit.id}
                                    className="bg-white dark:bg-[#1f2937] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col justify-between hover:border-blue-500/50 transition-all"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="text-2xl">🏢</div>

                                            <span className="text-[9px] font-black bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                                                {credit.status || 'Sin estado'}
                                            </span>
                                        </div>

                                        <h3 className="font-black uppercase truncate text-gray-900 dark:text-gray-200">
                                            {credit.nombreComercial}
                                        </h3>

                                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold mb-4">
                                            RFC: {credit.rfc}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <button
                                            onClick={() => loadForEdit(credit)}
                                            className="bg-gray-100 dark:bg-[#0e1624] hover:bg-blue-600 hover:text-white text-gray-700 dark:text-white py-3 rounded-xl text-[10px] font-black uppercase transition-all"
                                        >
                                            ✏️ Editar
                                        </button>

                                        <button
                                            onClick={() => generatePDF(credit)}
                                            className="bg-gray-100 dark:bg-[#0e1624] hover:bg-red-600 hover:text-white text-gray-700 dark:text-white py-3 rounded-xl text-[10px] font-black uppercase transition-all"
                                        >
                                            📄 PDF
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ToastContainer theme={darkMode ? 'dark' : 'light'} position="bottom-right" />
        </div>
    );
};

const InputField = ({ label, value, onChange, type = 'text' }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">
            {label}
        </label>

        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-50 dark:bg-[#0e1624] border border-gray-300 dark:border-gray-800 rounded-xl p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white w-full"
        />
    </div>
);

const SelectField = ({ label, value, onChange, options = [] }) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">
            {label}
        </label>

        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-50 dark:bg-[#0e1624] border border-gray-300 dark:border-gray-800 rounded-xl p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white w-full"
        >
            <option value="">Seleccionar...</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);

const ContactRow = ({ label, data, onChange }) => (
    <div className="bg-gray-50 dark:bg-[#0e1624]/30 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2 transition-colors">
        <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            {label}
        </div>

        <input
            placeholder="Nombre"
            value={data?.nombre || ''}
            onChange={(e) => onChange('nombre', e.target.value)}
            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 p-1 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 placeholder:text-gray-400"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <input
                placeholder="Tel."
                value={data?.tel || ''}
                onChange={(e) => onChange('tel', e.target.value)}
                className="bg-transparent border-b border-gray-300 dark:border-gray-800 p-1 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 placeholder:text-gray-400"
            />

            <input
                placeholder="Correo"
                value={data?.correo || ''}
                onChange={(e) => onChange('correo', e.target.value)}
                className="bg-transparent border-b border-gray-300 dark:border-gray-800 p-1 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 placeholder:text-gray-400"
            />
        </div>
    </div>
);

export default CreditRequestForm;