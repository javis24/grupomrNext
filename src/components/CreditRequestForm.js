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
    departamento: '',
    compras: '',
    pagos: '',
    usuario: '',
    otro: '',
    nombre: '',
    telmovil: '',
    correoContacto: '',
    referenciasComerciales: [
      {
        nombreempresa: '',
        contacto: '',
        domicilio: '',
        telefono: '',
        montocredito: '',
        antiguedad: ''
      }
    ],
    banco: '',
    numeroCuenta: '',
    sucursal: '',
    domicilioBanco: '',
    telefonoBanco: '',
    nombreGerente: '',
    cuentaDesde: '',
    saldoPromedio: '',
    personalAutorizado: Array(5).fill({ nombre: '', ine: '', firma: '' }), // Hasta 5 personas
    aval: {
      nombre: '',
      direccion: '',
      colonia: '',
      entreCalles: '',
      telefono: '',
      fax: '',
      correoElectronico: '',
      ine: '',
      firma: '',
      cp: ''
    },
    facturacion: {
      metodoPago: '',
      usoCFDI: '',
      institucion: '',
      cuenta: '',
      domicilioRevision: '',
      diaPago: ''
    },
    creditoSolicitado: {
      volumenEstimado: '',
      solicitaCredito: '',
      condicionesCredito: '',
      nombreFirmaAsesor: '',
      nombreFirmaCobranza: '',
      nombreFirmaComercial: ''
    },
      documentos: {
      cifReciente: false,
      comprobanteDomicilio: false,
      identificacionOficial: false,
      caratulaEstadoCuenta: false,
      actaConstitutiva: false,
      constanciaFiscal: false,
      opinionPositiva: false,
      fechaOtorgada: '',
      creditoAprobado: false,
      creditoRechazado: false,
      cantidadCredito: '',
      recomendaciones: '',
      observaciones: ''
    },

    pagare: {
      no: '',                
      buenoPor: '',          
      lugar: '',              
     dia: '',                
      mes: '',               
      anio: '',              
      beneficiario: '',       
      lugarPago: '',          
      fechaPago: '',          
      cantidadPago: '',       
      moneda: '',              
    nombreDeudor: '',        
      documentoDeudor: '',    
      direccionDeudor: '',     
      telefonoDeudor: '',      
      firmaRepresentante: ''   
        }


  });

  const handleChangeReference = (index, e) => {
    const { name, value } = e.target;
    const updatedReferences = [...formData.referenciasComerciales];
    updatedReferences[index][name] = value;
    setFormData({ ...formData, referenciasComerciales: updatedReferences });
  };

  const addNewReference = () => {
    setFormData({
      ...formData,
      referenciasComerciales: [
        ...formData.referenciasComerciales,
        {
          nombreempresa: '',
          contacto: '',
          domicilio: '',
          telefono: '',
          montocredito: '',
          antiguedad: ''
        }
      ]
    });
  };

  const [open, setOpen] = useState(1);
  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        documentos: { ...formData.documentos, [name]: checked }
      });
    } else if (name.startsWith('aval.')) {
      setFormData({
        ...formData,
        aval: { ...formData.aval, [name.split('.')[1]]: value }
      });
    } else if (name.startsWith('facturacion.')) {
      setFormData({
        ...formData,
        facturacion: { ...formData.facturacion, [name.split('.')[1]]: value }
      });
    } else if (name.startsWith('creditoSolicitado.')) {
      setFormData({
        ...formData,
        creditoSolicitado: { ...formData.creditoSolicitado, [name.split('.')[1]]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Logo del encabezado
    const imgUrl = '/logo_mr.png';  // Ruta relativa desde el directorio 'public'
    const image = new Image();
    image.src = imgUrl;

    image.onload = () => {
      // Añadir logo y encabezado
      doc.addImage(image, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(11);
      doc.text("Materiales Reutilizables S.A. de C.V.", 105, 20, { align: 'center' });
      doc.text("MRE040121UBA", 105, 27, { align: 'center' });
      doc.text("C Benito Juarez 112 sur, Col. Primero de Mayo, Cd. Lerdo, Dgo. C.P. 35169", 105, 34, { align: 'center' });

      // Línea separadora y título
      doc.setLineWidth(0.5);
      doc.line(10, 40, 200, 40);  // Línea horizontal
      doc.setFontSize(13);
      doc.text("MATERIALES REUTILIZABLES SA DE CV", 105, 47, null, 'center');

      // Sección superior: Empresa y Fecha
      doc.setFontSize(10);
      doc.rect(10, 55, 190, 15); // Cuadro principal
      doc.text("EMPRESA (INFORMACIÓN INTERNA)", 15, 63);
      doc.rect(150, 55, 50, 15); // Cuadro para fecha
      doc.text("FECHA", 155, 63);

       // Bloque de información del cliente
    const clientDetails = [
      ["NOMBRE COMERCIAL", formData.nombreComercial, "RAZÓN SOCIAL", formData.razonSocial],
      ["RFC", formData.rfc, "REPRESENTANTE LEGAL", formData.representanteLegal],
    ];

    doc.autoTable({
      body: clientDetails,
      startY: 75,
      theme: 'grid',
      margin: { left: 10 },
      styles: {
        cellPadding: 2,
        fontSize: 8,
        valign: 'middle',
        halign: 'left',
        lineWidth: 0.1,  // Ancho de los bordes
        lineColor: [0, 0, 0],  // Color de los bordes (negro)
      },
      columnStyles: {
        0: { cellWidth: 50 }, 
        1: { cellWidth: 45 },
        2: { cellWidth: 50 },
        3: { cellWidth: 45 }
      }
    });

      // Domicilio Fiscal
          doc.setFontSize(10);
          doc.text("DOMICILIO FISCAL", 105, doc.lastAutoTable.finalY + 10, null, 'center');

          const addressDetails = [
            ["CALLE", formData.calle, "NÚMERO", formData.numero],
            ["COLONIA", formData.colonia, "CIUDAD", formData.ciudad],
            ["ESTADO", formData.estado, "CP", formData.cp]
          ];

          doc.autoTable({
            body: addressDetails,
            startY: doc.lastAutoTable.finalY + 15,
            theme: 'grid',
            margin: { left: 10 },
            styles: {
              cellPadding: 2,
              fontSize: 8,
              halign: 'center'
            },
            columnStyles: {
              0: { cellWidth: 40 }, 
              1: { cellWidth: 55 },
              2: { cellWidth: 40 },
              3: { cellWidth: 55 }
            }
          });

          // Añadir salto de línea
          doc.text(" ", 1, doc.lastAutoTable.finalY + 1);

          // Teléfonos y Correo
          const contactDetails = [
            ["TELÉFONO (1)", formData.telefono1],
            ["TELÉFONO (2)", formData.telefono2],
            ["CORREO", formData.correo]
          ];

          doc.autoTable({
            body: contactDetails,
            startY: doc.lastAutoTable.finalY + 10, // Salto de línea entre secciones
            theme: 'grid', 
            margin: { left: 10 },
            styles: {
              cellPadding: 2,
              fontSize: 8,
              halign: 'center'
            },
            columnStyles: {
              0: { cellWidth: 60 }, 
              1: { cellWidth: 120 }
            }
          });


     // Contacto Comercial
        doc.setFontSize(12);
        doc.text("CONTACTO COMERCIAL", 105, doc.lastAutoTable.finalY + 15, null, 'center');

        const commercialContact = [
          ["DEPARTAMENTO", "NOMBRE", "TEL / MOVIL", "CORREO"],
          ["COMPRAS", formData.comprasNombre, formData.comprasTel, formData.comprasCorreo],
          ["PAGOS", formData.pagosNombre, formData.pagosTel, formData.pagosCorreo],
          ["USUARIO/OPERACIÓN", formData.usuarioNombre, formData.usuarioTel, formData.usuarioCorreo],
          ["OTRO:", formData.otroNombre, formData.otroTel, formData.otroCorreo]
        ];

        doc.autoTable({
          head: [commercialContact[0]],  // Encabezados de la tabla
          body: commercialContact.slice(1),  // Filas de datos
          startY: doc.lastAutoTable.finalY + 25,  // Posiciona después de la tabla anterior
          theme: 'grid',  // Aplica los bordes a las celdas
          margin: { left: 8 },
          headStyles: { fillColor: [255, 204, 0] },  // Color de fondo de los encabezados
          styles: {
            fontSize: 10,  // Tamaño de la fuente de las celdas
            halign: 'center'  // Centra el texto en las celdas
          },
          columnStyles: {
            0: { cellWidth: 40 },  // Ajusta el ancho de la columna "Departamento"
            1: { cellWidth: 55 },  // Ajusta el ancho de la columna "Nombre"
            2: { cellWidth: 45 },  // Ajusta el ancho de la columna "Tel / Movil"
            3: { cellWidth: 45 }   // Ajusta el ancho de la columna "Correo"
          }
        });

       


      // Referencias Comerciales - Primera vez
      doc.setFontSize(12);
      doc.text("REFERENCIAS COMERCIALES", 105, doc.lastAutoTable.finalY + 15, null, 'center');

      const references = [
        ["NOMBRE DE LA EMPRESA", "CONTACTO", "DOMICILIO", "TELÉFONO", "MONTO DE CRÉDITO", "ANTIGÜEDAD"],
        [formData.nombreempresa, formData.contacto, formData.domicilio, formData.telefono, formData.montocredito, formData.antiguedad],
        ["", "", "", "", "", ""]
      ];

      doc.autoTable({
        head: [references[0]],
        body: references.slice(1),
        startY: doc.lastAutoTable.finalY + 28,
        theme: 'grid',
        headStyles: { fillColor: [255, 204, 0] },
        styles: {
          fontSize: 8,
          halign: 'center',
        }
      });

  
           // Referencias Bancarias
            // Forzar un salto de página antes de "REFERENCIAS BANCARIAS"
            doc.addPage();

            doc.setFontSize(12);
            doc.text("REFERENCIAS BANCARIAS", 105, 20, null, 'center'); 

            const bankingReferences = [
              ["BANCO", formData.banco],
              ["NÚMERO DE CUENTA", formData.numeroCuenta],
              ["SUCURSAL", formData.sucursal],
              ["DOMICILIO", formData.domicilioBanco],
              ["TELÉFONO", formData.telefonoBanco],
              ["NOMBRE DEL ASESOR O GERENTE PARA SOLICITAR REFERENCIAS", formData.nombreGerente],
              ["LA CUENTA OPERA DESDE", formData.cuentaDesde],
              ["SALDO PROMEDIO MENSUAL", formData.saldoPromedio]
            ];

            doc.autoTable({
              body: bankingReferences,
              startY: 30,  // Espacio entre la tabla anterior y esta
              theme: 'grid',  // Aplica el tema con bordes para las celdas
              headStyles: { fillColor: [255, 204, 0] },  // Color de fondo de los encabezados
              styles: {
                fontSize: 10,  // Tamaño de la fuente en las celdas
                halign: 'left'  // Alineación del texto a la izquierda
              },
              columnStyles: {
                0: { cellWidth: 90 },  // Ancho de la primera columna
                1: { cellWidth: 100 }  // Ancho de la segunda columna
              }
            });





      // Personal autorizado para recoger mercancía
          doc.setFontSize(8);
          doc.text("PERSONAL AUTORIZADO PARA RECOGER MERCANCÍA Y SUSCRIBIR DOCUMENTOS", 105, doc.lastAutoTable.finalY + 20, null, 'center');

          const authorizedPersonnel = formData.personalAutorizado.map((persona, index) => [
            `${index + 1}. NOMBRE`, persona.nombre, persona.ine, persona.firma
          ]);

          doc.autoTable({
            head: [["", "NOMBRE", "No. INE O PASAPORTE", "FIRMA"]],
            body: authorizedPersonnel,
            startY: doc.lastAutoTable.finalY + 25,
            theme: 'grid',
            headStyles: { fillColor: [255, 204, 0] },
            styles: {
              fontSize: 8,
              halign: 'center',
            },
            columnStyles: {
              0: { cellWidth: 20 },  // Para el número
              1: { cellWidth: 50 },  // Para el nombre
              2: { cellWidth: 50 },  // Para el No. INE
              3: { cellWidth: 50 }   // Para la firma
            }
          });


        // Ajuste para la sección de Aval o Responsable Solidario
        doc.setFontSize(8);
        doc.text("AVAL O RESPONSABLE SOLIDARIO (CUANDO SE PERSONA MORAL FIRMARA UNA PERSONA FÍSICA)", 105, doc.lastAutoTable.finalY + 20, null, 'center');

        const avalDetails = [
          ["NOMBRE", formData.aval.nombre, "No. INE O PASAPORTE", formData.aval.ine, "FIRMA", formData.aval.firma],
          ["DIRECCIÓN", formData.aval.direccion, "", "", "", ""],
          ["COLONIA", formData.aval.colonia, "CP", formData.aval.cp, "", ""],
          ["ENTRE CALLES", formData.aval.entreCalles, "", "", "", ""],
          ["TELÉFONO", formData.aval.telefono, "FAX", formData.aval.fax, "CORREO ELECTRÓNICO", formData.aval.correoElectronico]
        ];

        doc.autoTable({
          body: avalDetails,
          startY: doc.lastAutoTable.finalY + 25,
          theme: 'grid',
          headStyles: { fillColor: [255, 204, 0] },
          styles: {
            fontSize: 10,
            halign: 'left',
          },
          columnStyles: {
            0: { cellWidth: 30 },  // Ajuste de ancho para la primera columna (NOMBRE, DIRECCIÓN, etc.)
            1: { cellWidth: 30 },  // Ajuste de ancho para la segunda columna (Datos del aval)
            2: { cellWidth: 30 },  // Ajuste de ancho para la tercera columna (No. INE, CP, etc.)
            3: { cellWidth: 30 },  // Ajuste de ancho para la cuarta columna (Valores adicionales)
            4: { cellWidth: 30 },  // Ajuste de ancho para la quinta columna (FIRMA, CP, etc.)
          }
        });

        doc.addPage();




      // Datos para la Facturación
          doc.setFontSize(12);
          doc.text("DATOS PARA LA FACTURACIÓN", 105, 20, null, 'center'); 

          const billingDetails = [
            ["MÉTODO DE PAGO", formData.facturacion.metodoPago],
            ["USO DE CFDI", formData.facturacion.usoCFDI],
            ["INSTITUCIÓN", formData.facturacion.institucion],
            ["CUENTA", formData.facturacion.cuenta],
            ["DOMICILIO, DÍA Y HORARIO DE REVISIÓN DE FACTURA", formData.facturacion.domicilioRevision],
            ["DÍA DE PAGOS", formData.facturacion.diaPago]
          ];

          doc.autoTable({
            body: billingDetails,
            startY: 25,  // Añadir espacio entre tablas si ya hay otras
            theme: 'grid',
            styles: {
              cellPadding: 2,
              fontSize: 10,
              halign: 'left',
            },
            columnStyles: {
              0: { cellWidth: 100 },  // Ajusta los anchos de las columnas
              1: { cellWidth: 90 }
            }
          });

          // Nota al final de la sección de facturación
          doc.setFontSize(8);

          // Dividir el texto en líneas que se ajusten al ancho de la página
          const notaText = doc.splitTextToSize(
            "NOTA: NO REALIZAMOS CANCELACIÓN DE FACTURAS POR LO QUE ES IMPORTANTE NOTIFICARNOS CON TIEMPO CUALQUIER CAMBIO EN SUS DATOS.",
            180 // Ajustar el tamaño a 180 para que quede mejor alineado en el documento
          );

          doc.text(notaText, 15, doc.lastAutoTable.finalY + 10);
     
      // Sección de crédito solicitado
        doc.setFontSize(12);
        doc.text("CRÉDITO SOLICITADO", 105, doc.lastAutoTable.finalY + 20, null, 'center');

        // Detalles del crédito solicitado
        const creditDetails = [
            ["VOLUMEN ESTIMADO DE COMPRA MENSUAL", formData.creditoSolicitado.volumenEstimado],
            ["SE SOLICITA UN CRÉDITO DE", formData.creditoSolicitado.solicitaCredito],
            ["CONDICIONES DE CRÉDITO", formData.creditoSolicitado.condicionesCredito]
        ];

        doc.autoTable({
            body: creditDetails,
            startY: doc.lastAutoTable.finalY + 25,
            theme: 'grid',
            styles: {
                cellPadding: 2,
                fontSize: 8,
                halign: 'left',
            },
            columnStyles: {
                0: { cellWidth: 100 },  // Ajusta los anchos de las columnas
                1: { cellWidth: 90 }
            }
        });

// Sección de firmas del asesor, cobranza y comercial
const firmas = [
    ["NOMBRE Y FIRMA DEL ASESOR", "NOMBRE Y FIRMA CRÉDITO Y COBRANZA", "NOMBRE Y FIRMA DEPTO. COMERCIAL"],
    ["", "", ""]
];

doc.autoTable({
    head: [firmas[0]],
    body: [firmas[1]],
    startY: doc.lastAutoTable.finalY + 10,
    margin: { left: 8 },
    theme: 'grid',
    styles: {
        fontSize: 8,
        halign: 'center',
    },
    columnStyles: {
        0: { cellWidth: 65 }, 
        1: { cellWidth: 65 },
        2: { cellWidth: 65 }
    }
});

// Declaración y firma de conformidad del cliente
doc.setFontSize(8);
doc.text(
  "DECLARO QUE LOS DATOS ASENTADOS EN LA SOLICITUD SON VERÍDICOS Y AUTORIZO QUE LOS COMPRUEBE A SU ENTERA SATISFACCIÓN",
  105, 
  doc.lastAutoTable.finalY + 15,
  null, 
  'center'
);

doc.setFontSize(12);
doc.text("_____________________________", 105, doc.lastAutoTable.finalY + 25, null, 'center');
doc.text("FIRMA DE CONFORMIDAD CLIENTE", 105, doc.lastAutoTable.finalY + 35, null, 'center');


  


      // Ajustar el espacio entre la firma de conformidad y los documentos a anexar
if (doc.lastAutoTable.finalY + 50 > doc.internal.pageSize.height) {
  doc.addPage(); // Añadir nueva página si no hay suficiente espacio
}
doc.setFontSize(8); 
doc.text("POR FAVOR ANEXAR LOS SIGUIENTES DOCUMENTOS (De forma digital)", 105, doc.lastAutoTable.finalY + 50, null, 'center'); 

// Lista de títulos de los documentos
const documentTitles = [
  "CIF RECENTE",
  "COMPROBANTE DE DOMICILIO RECENTE",
  "IDENTIFICACION OFICIAL (EN EL CASO DE PERSONA MORAL, ID DEL REPRESENTANTE LEGAL)",
  "CARÁTULA DEL ESTADO DE CUENTA, SOLO EN DONDE SE VEAN LOS DATOS BANCARIOS",
  "COPIA DE ACTA CONSTITUTIVA",
  "CONSTANCIA DE SITUACIÓN FISCAL ACTUALIZADA",
  "OPINIÓN POSITIVA (32 D) ACTUALIZADA"
];

// Posición inicial para los títulos (agregando un espacio extra para mayor separación)
let startingY = doc.lastAutoTable.finalY + 60; 

// Imprimir cada título en una nueva línea con el espacio ajustado y centrado
doc.setFontSize(10); 
documentTitles.forEach((title, index) => {
  if (startingY + (index * 10) > doc.internal.pageSize.height - 20) {
    doc.addPage(); // Añadir nueva página si el contenido no cabe
    startingY = 20; // Reiniciar la posición de Y en la nueva página
  }
  
  // Obtener el ancho de la página
  const pageWidth = doc.internal.pageSize.width;
  
  // Calcular el ancho del texto
  const textWidth = doc.getTextWidth(title);
  
  // Calcular la posición X para centrar el texto
  const xPosition = (pageWidth - textWidth) / 2;
  
  // Imprimir el título centrado
  doc.text(title, xPosition, startingY + (index * 10)); // Ajusta el espacio vertical entre cada título
});









// Título para la sección de uso exclusivo (en la siguiente página)
doc.addPage(); // Añade una nueva página
doc.setFontSize(12); 
doc.text("PARA USO EXCLUSIVO DE MATERIALES REUTILIZABLES S.A. DE C.V.", 105, 20, null, 'center'); 

// Contenido de los detalles exclusivos
const exclusiveDetails = [
  ["FECHA OTORGADA", formData.documentos.fechaOtorgada],
  ["CRÉDITO APROBADO", formData.documentos.creditoAprobado ? "Sí" : "No", "POR LA CANTIDAD DE", formData.documentos.cantidadCredito],
  ["CRÉDITO RECHAZADO", formData.documentos.creditoRechazado ? "Sí" : "No"],
  ["RECOMENDACIONES", formData.documentos.recomendaciones],
  ["OBSERVACIONES", formData.documentos.observaciones]
];

// Ajustar `startY` para que la tabla comience después del título
doc.autoTable({
  body: exclusiveDetails,
  startY: 25, // Ajusta el valor para que la tabla empiece después del título
  theme: 'grid',
  styles: {
    fontSize: 8,
    halign: 'left',
  },
  columnStyles: {
    0: { cellWidth: 80 },
    1: { cellWidth: 40 },
    2: { cellWidth: 80 },
    3: { cellWidth: 40 }
  }
});

// Firma de autorización
doc.setFontSize(12);
doc.text("_____________________________", 105, doc.lastAutoTable.finalY + 25, null, 'center');
doc.text("FIRMA DE AUTORIZACIÓN", 105, doc.lastAutoTable.finalY + 35, null, 'center');


// Ajusta el espacio entre el bloque anterior y el pagaré
const startYForPagare = doc.lastAutoTable.finalY + 70; // Incrementa el valor para agregar más espacio

// Pagaré Título
doc.setFontSize(16);
doc.text("PAGARÉ", 20, startYForPagare);  // Título "PAGARÉ"
doc.rect(15, startYForPagare - 5, 182, 152);  // Borde del pagaré

// No., Bueno por, y fecha de creación
doc.setFontSize(10);
doc.text("No.", 160, startYForPagare + 10);
doc.rect(170, startYForPagare + 7, 20, 6); // Cuadro para No.
doc.text("BUENO POR $", 130, startYForPagare + 10); // Ajuste de la posición horizontal
doc.text("EN", 20, startYForPagare + 20);
doc.line(30, startYForPagare + 20, 100, startYForPagare + 20); // Línea para el lugar
doc.text("a", 105, startYForPagare + 20);
doc.line(110, startYForPagare + 20, 120, startYForPagare + 20); // Línea para el día
doc.text("de", 125, startYForPagare + 20);
doc.line(135, startYForPagare + 20, 165, startYForPagare + 20); // Línea para el mes
doc.text("del 20", 170, startYForPagare + 20);
doc.line(185, startYForPagare + 20, 195, startYForPagare + 20); // Línea para el año

// Cuerpo del pagaré
doc.text("Debo y pagaré incondicionalmente este pagaré a la orden de", 20, startYForPagare + 40);
doc.line(130, startYForPagare + 40, 195, startYForPagare + 40); // Línea para el nombre del beneficiario
doc.text("en", 20, startYForPagare + 50);
doc.line(30, startYForPagare + 50, 90, startYForPagare + 50); // Línea para el lugar del pago
doc.text("en la fecha:", 100, startYForPagare + 50);
doc.line(130, startYForPagare + 50, 195, startYForPagare + 50); // Línea para la fecha del pago
doc.text("la cantidad:", 20, startYForPagare + 60);
doc.line(50, startYForPagare + 60, 100, startYForPagare + 60); // Línea para la cantidad
doc.text("en moneda:", 110, startYForPagare + 60);
doc.line(140, startYForPagare + 60, 195, startYForPagare + 60); // Línea para la moneda

// Mensaje de aviso
doc.setFontSize(10);
doc.text("En caso de no cumplir con el pago en la fecha acordada, se procederá legalmente.", 20, startYForPagare + 70);

// Datos del deudor
doc.setFontSize(12);
doc.text("Datos del deudor", 20, startYForPagare + 80);
doc.setFontSize(10);
doc.text("Nombre", 20, startYForPagare + 90);
doc.line(50, startYForPagare + 90, 195, startYForPagare + 90); // Línea para el nombre del deudor
doc.text("N° Documento", 20, startYForPagare + 100);
doc.line(50, startYForPagare + 100, 195, startYForPagare + 100); // Línea para el número de documento
doc.text("Dirección", 20, startYForPagare + 110);
doc.line(50, startYForPagare + 110, 195, startYForPagare + 110); // Línea para la dirección
doc.text("Teléfono", 20, startYForPagare + 120);
doc.line(50, startYForPagare + 120, 195, startYForPagare + 120); // Línea para el teléfono

// Firma del representante legal
doc.setFontSize(10);
doc.text("Acepto y pagaré a su vencimiento", 120, startYForPagare + 130);
doc.line(150, startYForPagare + 140, 195, startYForPagare + 140); // Línea para la firma del representante
doc.text("Firma del representante legal", 150, startYForPagare + 145);

doc.addPage();

// Reseteamos la posición de Y después de agregar la nueva página
let currentYPosition = 20;// Nueva posición inicial en la nueva página

// Declaración inicial en un solo párrafo centrado
doc.setFontSize(10);
let text = "Declaramos que la información que antecede es verdadera, correcta y completa. Autorizo a la empresa Materiales Reutilizables, S.A de C.V. hace uso de ella y realizar la investigación de crédito que considere necesaria. Así mismo, autorizamos a las referencias comerciales y bancarias proporcionar la información solicitada.";

// Ancho máximo que puede ocupar el texto
let pageWidth = doc.internal.pageSize.width; 
let margin = 20; // margen izquierdo y derecho
let maxTextWidth = pageWidth - margin * 2; // resta márgenes al ancho total

// Dividir el texto para ajustarlo a las líneas
let splittedText = doc.splitTextToSize(text, maxTextWidth);

// Obtener la posición horizontal central para todo el párrafo
let textWidth = doc.getTextWidth(splittedText.join(" "));
let startX = (pageWidth - textWidth) / 2;

// Ajustar la posición vertical según sea necesario
let startY = currentYPosition; // Ajusta según sea necesario

// Imprimir el texto centrado en su totalidad
splittedText.forEach((line, index) => {
  doc.text(line, pageWidth / 2, startY + (index * 10), { align: "center" });
});









      // Líneas para las firmas
const linePositionY = currentYPosition + 60; // Ajustamos la posición para las líneas de firma

// Línea para la firma del representante legal más a la izquierda
doc.line(30, linePositionY, 80, linePositionY); // Ajustamos X para la firma
doc.text("NOMBRE Y FIRMA DEL REP. LEGAL", 20, linePositionY + 10); // Texto ajustado más a la izquierda

// Línea para el sello de la empresa más a la izquierda
doc.line(150, linePositionY, 180, linePositionY); // Ajustamos X para el sello
doc.text("SELLO DE LA EMPRESA", 130, linePositionY + 10); // Texto ajustado más a la izquierda

// Cuadro para autorización Grupo MR más a la izquierda
doc.rect(70, linePositionY + 30, 80, 20); // Cuadro más a la izquierda
doc.text("AUTORIZACIÓN GRUPO MR", 90, linePositionY + 45); // Texto dentro del cuadro ajustado más a la izquierda

// Nota final ajustada más a la izquierda
doc.setFillColor(230, 230, 230); // Fondo gris para la nota
doc.rect(10, linePositionY + 70, 180, 10, 'F'); // Cuadro con fondo gris más a la izquierda
doc.setFontSize(9);
doc.setTextColor(0);
doc.text("NOTA: FAVOR DE LLENAR ESTE FORMATO DE MANERA DIGITAL, IMPRIMIR, SELLAR Y FIRMAR", 15, linePositionY + 77);
doc.text("PARA ESCANEAR Y ENVIAR POR VÍA DIGITAL.", 40, linePositionY + 85);


     



   
         // Guardar el archivo PDF
         doc.save('solicitud_credito.pdf');
       };
     };
   
      return (
        <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Solicitud de Crédito</h1>
        <form className="grid grid-cols-1 gap-6">
          
          {/* Nombre Comercial */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Nombre Comercial</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block">Nombre Comercial</label>
                <input
                  type="text"
                  name="nombreComercial"
                  value={formData.nombreComercial}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Razón Social</label>
                <input
                  type="text"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">RFC</label>
                <input
                  type="text"
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Representante Legal</label>
                <input
                  type="text"
                  name="representanteLegal"
                  value={formData.representanteLegal}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
            </div>
          </div>
      
          {/* Domicilio Fiscal */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Domicilio Fiscal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block">Calle</label>
                <input
                  type="text"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Número</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Colonia</label>
                <input
                  type="text"
                  name="colonia"
                  value={formData.colonia}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Estado</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Código Postal</label>
                <input
                  type="text"
                  name="cp"
                  value={formData.cp}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
            </div>
          </div>
      
          {/* Teléfonos y Correo */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Teléfonos y Correo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block">Teléfono (1)</label>
                <input
                  type="text"
                  name="telefono1"
                  value={formData.telefono1}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Teléfono (2)</label>
                <input
                  type="text"
                  name="telefono2"
                  value={formData.telefono2}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Correo</label>
                <input
                  type="text"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
            </div>
          </div>
      
          {/* Giro Comercial y Fecha de Inicio */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Giro Comercial y Fecha de Inicio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block">Giro Comercial</label>
                <input
                  type="text"
                  name="giroComercial"
                  value={formData.giroComercial}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
              <div>
                <label className="block">Fecha de Inicio de Actividades</label>
                <input
                  type="text"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  className="p-2 rounded border w-full text-black"
                />
              </div>
            </div>
          </div>

          {/* Contacto Comercial */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Contacto Comercial</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block">Compras</label>
                        <input
                          type="text"
                          name="compras"
                          value={formData.compras}
                          onChange={handleChange}
                          className="p-2 rounded border w-full text-black"
                        />
                      </div>
                      <div>
                        <label className="block">Pagos</label>
                        <input
                          type="text"
                          name="pagos"
                          value={formData.pagos}
                          onChange={handleChange}
                          className="p-2 rounded border w-full text-black"
                        />
                      </div>
                      <div>
                        <label className="block">Usuario/Operación</label>
                        <input
                          type="text"
                          name="usuario"
                          value={formData.usuario}
                          onChange={handleChange}
                          className="p-2 rounded border w-full text-black"
                        />
                      </div>
                      <div>
                        <label className="block">Otro</label>
                        <input
                          type="text"
                          name="otro"
                          value={formData.otro}
                          onChange={handleChange}
                          className="p-2 rounded border w-full text-black"
                        />
                      </div>
                      <div>
                        <label className="block">Tel / Movil</label>
                        <input
                          type="text"
                          name="telmovil"
                          value={formData.telmovil}
                          onChange={handleChange}
                          className="p-2 rounded border w-full text-black"
                        />
                      </div>
                      <div>
                        <label className="block">Correo Contacto</label>
                        <input
                          type="text"
                          name="correoContacto"
                          value={formData.correoContacto}
                          onChange={handleChange}
                          className="p-2 rounded border w-full text-black"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="container mx-auto p-6">
                    {/* Referencias Comerciales */}
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold mb-4">Referencias Comerciales</h2>
                      {formData.referenciasComerciales.map((reference, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block">Nombre de la Empresa ({index + 1})</label>
                            <input
                              type="text"
                              name="nombreempresa"
                              value={reference.nombreempresa}
                              onChange={(e) => handleChangeReference(index, e)}
                              className="p-2 rounded border w-full text-black"
                            />
                          </div>
                          <div>
                            <label className="block">Contacto ({index + 1})</label>
                            <input
                              type="text"
                              name="contacto"
                              value={reference.contacto}
                              onChange={(e) => handleChangeReference(index, e)}
                              className="p-2 rounded border w-full text-black"
                            />
                          </div>
                          <div>
                            <label className="block">Domicilio ({index + 1})</label>
                            <input
                              type="text"
                              name="domicilio"
                              value={reference.domicilio}
                              onChange={(e) => handleChangeReference(index, e)}
                              className="p-2 rounded border w-full text-black"
                            />
                          </div>
                          <div>
                            <label className="block">Teléfono ({index + 1})</label>
                            <input
                              type="text"
                              name="telefono"
                              value={reference.telefono}
                              onChange={(e) => handleChangeReference(index, e)}
                              className="p-2 rounded border w-full text-black"
                            />
                          </div>
                          <div>
                            <label className="block">Monto de Crédito ({index + 1})</label>
                            <input
                              type="text"
                              name="montocredito"
                              value={reference.montocredito}
                              onChange={(e) => handleChangeReference(index, e)}
                              className="p-2 rounded border w-full text-black"
                            />
                          </div>
                          <div>
                            <label className="block">Antigüedad ({index + 1})</label>
                            <input
                              type="text"
                              name="antiguedad"
                              value={reference.antiguedad}
                              onChange={(e) => handleChangeReference(index, e)}
                              className="p-2 rounded border w-full text-black"
                            />
                          </div>
                        </div>
                      ))}
                      {/* Referencias Bancarias */}
                        <div className="mb-8">
                          <h2 className="text-lg font-semibold mb-4">Referencias Bancarias</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block">Banco</label>
                              <input
                                type="text"
                                name="banco"
                                value={formData.banco}
                                onChange={handleChange}
                                className="p-2 rounded border w-full text-black"
                              />
                            </div>
                            <div>
                              <label className="block">Número de Cuenta</label>
                              <input
                                type="text"
                                name="numeroCuenta"
                                value={formData.numeroCuenta}
                                onChange={handleChange}
                                className="p-2 rounded border w-full text-black"
                              />
                            </div>
                            <div>
                              <label className="block">Sucursal</label>
                              <input
                                type="text"
                                name="sucursal"
                                value={formData.sucursal}
                                onChange={handleChange}
                                className="p-2 rounded border w-full text-black"
                              />
                            </div>
                            <div>
                              <label className="block">Domicilio del Banco</label>
                              <input
                                type="text"
                                name="domicilioBanco"
                                value={formData.domicilioBanco}
                                onChange={handleChange}
                                className="p-2 rounded border w-full text-black"
                              />
                            </div>
                            <div>
                              <label className="block">Teléfono del Banco</label>
                              <input
                                type="text"
                                name="telefonoBanco"
                                value={formData.telefonoBanco}
                                onChange={handleChange}
                                className="p-2 rounded border w-full text-black"
                              />
                            </div>
                            <div>
                              <label className="block">Nombre del Gerente</label>
                              <input
                                type="text"
                                name="nombreGerente"
                                value={formData.nombreGerente}
                                onChange={handleChange}
                                className="p-2 rounded border w-full text-black"
                              />
                            </div>
                            <div>
                              <label className="block">Cuenta Operativa Desde</label>
                              <input
                                type="text"
                                name="cuentaDesde"
                                value={formData.cuentaDesde}
                                onChange={handleChange}
                                className="p-2 rounded border w-full text-black"
                              />
                            </div>
                            <div>
                              <label className="block">Saldo Promedio</label>
                              <input
                                type="text"
                                name="saldoPromedio"
                                value={formData.saldoPromedio}
                                onChange={handleChange}
                                className="p-2 rounded border w-full text-black"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Personal autorizado */}
                          <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">Personal Autorizado</h2>
                            {formData.personalAutorizado.map((persona, index) => (
                              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div>
                                  <label className="block">Nombre {index + 1}</label>
                                  <input
                                    type="text"
                                    name={`nombre${index}`}
                                    value={persona.nombre}
                                    onChange={(e) => handlePersonalAutorizadoChange(index, 'nombre', e.target.value)}
                                    className="p-2 rounded border w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block">No. INE o Pasaporte {index + 1}</label>
                                  <input
                                    type="text"
                                    name={`ine${index}`}
                                    value={persona.ine}
                                    onChange={(e) => handlePersonalAutorizadoChange(index, 'ine', e.target.value)}
                                    className="p-2 rounded border w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block">Firma {index + 1}</label>
                                  <input
                                    type="text"
                                    name={`firma${index}`}
                                    value={persona.firma}
                                    onChange={(e) => handlePersonalAutorizadoChange(index, 'firma', e.target.value)}
                                    className="p-2 rounded border w-full"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Datos del aval */}
                            <div className="mb-8">
                              <h2 className="text-lg font-semibold mb-4">Datos del Aval</h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block">Nombre del Aval</label>
                                  <input
                                    type="text"
                                    name="aval.nombre"
                                    value={formData.aval.nombre}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                                <div>
                                  <label className="block">Dirección</label>
                                  <input
                                    type="text"
                                    name="aval.direccion"
                                    value={formData.aval.direccion}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                                <div>
                                  <label className="block">Colonia</label>
                                  <input
                                    type="text"
                                    name="aval.colonia"
                                    value={formData.aval.colonia}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                                <div>
                                  <label className="block">Entre Calles</label>
                                  <input
                                    type="text"
                                    name="aval.entreCalles"
                                    value={formData.aval.entreCalles}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                                <div>
                                  <label className="block">Teléfono</label>
                                  <input
                                    type="text"
                                    name="aval.telefono"
                                    value={formData.aval.telefono}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                                <div>
                                  <label className="block">Fax</label>
                                  <input
                                    type="text"
                                    name="aval.fax"
                                    value={formData.aval.fax}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                                <div>
                                  <label className="block">Correo Electrónico</label>
                                  <input
                                    type="text"
                                    name="aval.correoElectronico"
                                    value={formData.aval.correoElectronico}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                                <div>
                                  <label className="block">No. INE o Pasaporte</label>
                                  <input
                                    type="text"
                                    name="aval.ine"
                                    value={formData.aval.ine}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                                <div>
                                  <label className="block">Firma</label>
                                  <input
                                    type="text"
                                    name="aval.firma"
                                    value={formData.aval.firma}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                                <div>
                                  <label className="block">Código Postal (CP)</label>
                                  <input
                                    type="text"
                                    name="aval.cp"
                                    value={formData.aval.cp}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full mb-2"
                                  />
                                </div>
                              </div>
                            </div>


                              {/* Datos de Facturación */}
                              <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-4">Datos de Facturación</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block">Método de Pago</label>
                                    <input
                                      type="text"
                                      name="facturacion.metodoPago"
                                      value={formData.facturacion.metodoPago}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="block">Uso de CFDI</label>
                                    <input
                                      type="text"
                                      name="facturacion.usoCFDI"
                                      value={formData.facturacion.usoCFDI}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="block">Institución</label>
                                    <input
                                      type="text"
                                      name="facturacion.institucion"
                                      value={formData.facturacion.institucion}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="block">Cuenta</label>
                                    <input
                                      type="text"
                                      name="facturacion.cuenta"
                                      value={formData.facturacion.cuenta}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block">Domicilio, Día y Horario de Revisión de Factura</label>
                                    <input
                                      type="text"
                                      name="facturacion.domicilioRevision"
                                      value={formData.facturacion.domicilioRevision}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="block">Día de Pago</label>
                                    <input
                                      type="text"
                                      name="facturacion.diaPago"
                                      value={formData.facturacion.diaPago}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                                {/* Sección de Crédito Solicitado */}
                              <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-4">Crédito Solicitado</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block">Volumen Estimado de Compra Mensual</label>
                                    <input
                                      type="text"
                                      name="creditoSolicitado.volumenEstimado"
                                      value={formData.creditoSolicitado.volumenEstimado}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="block">Se Solicita un Crédito de</label>
                                    <input
                                      type="text"
                                      name="creditoSolicitado.solicitaCredito"
                                      value={formData.creditoSolicitado.solicitaCredito}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block">Condiciones de Crédito</label>
                                    <textarea
                                      name="creditoSolicitado.condicionesCredito"
                                      value={formData.creditoSolicitado.condicionesCredito}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="block">Nombre y Firma del Asesor</label>
                                    <input
                                      type="text"
                                      name="creditoSolicitado.nombreFirmaAsesor"
                                      value={formData.creditoSolicitado.nombreFirmaAsesor}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="block">Nombre y Firma Crédito y Cobranza</label>
                                    <input
                                      type="text"
                                      name="creditoSolicitado.nombreFirmaCobranza"
                                      value={formData.creditoSolicitado.nombreFirmaCobranza}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="block">Nombre y Firma Dpto. Comercial</label>
                                    <input
                                      type="text"
                                      name="creditoSolicitado.nombreFirmaComercial"
                                      value={formData.creditoSolicitado.nombreFirmaComercial}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Sección de Uso Exclusivo */}
                            <div className="mb-8">
                              <h2 className="text-lg font-semibold mb-4">Para Uso Exclusivo de Materiales Reutilizables S.A. de C.V.</h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block">Fecha Otorgada</label>
                                  <input
                                    type="date"
                                    name="documentos.fechaOtorgada"
                                    value={formData.documentos.fechaOtorgada}
                                    onChange={handleChange}
                                    className="p-2 rounded border w-full"
                                  />
                                </div>
                                <div className="grid grid-cols-2">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      name="documentos.creditoAprobado"
                                      checked={formData.documentos.creditoAprobado}
                                      onChange={handleChange}
                                      className="mr-2"
                                    />
                                    <label>Crédito Aprobado</label>
                                  </div>
                                  <div>
                                    <label className="block">Por la Cantidad de:</label>
                                    <input
                                      type="text"
                                      name="documentos.cantidadCredito"
                                      value={formData.documentos.cantidadCredito}
                                      onChange={handleChange}
                                      className="p-2 rounded border w-full"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    name="documentos.creditoRechazado"
                                    checked={formData.documentos.creditoRechazado}
                                    onChange={handleChange}
                                    className="mr-2"
                                  />
                                  <label>Crédito Rechazado</label>
                                </div>
                              </div>
                              <div className="mt-4">
                                <label className="block">Recomendaciones</label>
                                <textarea
                                  name="documentos.recomendaciones"
                                  value={formData.documentos.recomendaciones}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div className="mt-4">
                                <label className="block">Observaciones</label>
                                <textarea
                                  name="documentos.observaciones"
                                  value={formData.documentos.observaciones}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                            </div>

                            <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">Pagaré</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block">No. de Pagaré</label>
                                <input
                                  type="text"
                                  name="pagare.no"
                                  value={formData.pagare.no}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Bueno por $</label>
                                <input
                                  type="text"
                                  name="pagare.buenoPor"
                                  value={formData.pagare.buenoPor}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Lugar</label>
                                <input
                                  type="text"
                                  name="pagare.lugar"
                                  value={formData.pagare.lugar}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Día</label>
                                <input
                                  type="text"
                                  name="pagare.dia"
                                  value={formData.pagare.dia}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Mes</label>
                                <input
                                  type="text"
                                  name="pagare.mes"
                                  value={formData.pagare.mes}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Año</label>
                                <input
                                  type="text"
                                  name="pagare.anio"
                                  value={formData.pagare.anio}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Beneficiario</label>
                                <input
                                  type="text"
                                  name="pagare.beneficiario"
                                  value={formData.pagare.beneficiario}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Lugar de Pago</label>
                                <input
                                  type="text"
                                  name="pagare.lugarPago"
                                  value={formData.pagare.lugarPago}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Fecha de Pago</label>
                                <input
                                  type="text"
                                  name="pagare.fechaPago"
                                  value={formData.pagare.fechaPago}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Cantidad de Pago</label>
                                <input
                                  type="text"
                                  name="pagare.cantidadPago"
                                  value={formData.pagare.cantidadPago}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Moneda</label>
                                <input
                                  type="text"
                                  name="pagare.moneda"
                                  value={formData.pagare.moneda}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                            </div>

                            {/* Datos del Deudor */}
                            <h3 className="text-lg font-semibold mt-6">Datos del Deudor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block">Nombre del Deudor</label>
                                <input
                                  type="text"
                                  name="pagare.nombreDeudor"
                                  value={formData.pagare.nombreDeudor}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">N° Documento del Deudor</label>
                                <input
                                  type="text"
                                  name="pagare.documentoDeudor"
                                  value={formData.pagare.documentoDeudor}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Dirección del Deudor</label>
                                <input
                                  type="text"
                                  name="pagare.direccionDeudor"
                                  value={formData.pagare.direccionDeudor}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                              <div>
                                <label className="block">Teléfono del Deudor</label>
                                <input
                                  type="text"
                                  name="pagare.telefonoDeudor"
                                  value={formData.pagare.telefonoDeudor}
                                  onChange={handleChange}
                                  className="p-2 rounded border w-full"
                                />
                              </div>
                            </div>

                            {/* Firma del Representante Legal */}
                            <div className="mt-4">
                              <label className="block">Firma del Representante Legal</label>
                              <input
                                type="text"
                                name="pagare.firmaRepresentante"
                                value={formData.pagare.firmaRepresentante}
                                onChange={handleChange}
                                className="p-2 rounded border w-full"
                              />
                            </div>
                          </div>
                  </div>
            </div>

      
          {/* Botón para enviar o generar PDF */}
          <button
            type="button"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full text-black"
            onClick={exportToPDF}
          >
            Exportar a PDF
          </button>
        </form>
      </div>
      

      );
    };
    
    export default CreditRequestForm;
    
