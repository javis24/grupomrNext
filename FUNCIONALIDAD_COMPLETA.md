# 📋 Documentación Completa - Funcionalidad Full Stack

## 🏗️ Arquitectura General

**Nombre del Proyecto:** GrupoMR CRM  
**Stack Tecnológico:**
- **Frontend:** Next.js 16, React 19, Tailwind CSS, Material Tailwind
- **Backend:** Next.js API Routes, Node.js
- **Base de Datos:** MySQL (con Sequelize ORM)
- **Autenticación:** JWT (jsonwebtoken)
- **Almacenamiento:** Cloudinary
- **Seguridad:** bcryptjs (hashing de contraseñas)
- **Comunicación Real-time:** Socket.io

---

## 📱 Módulos Principales de la Aplicación

### 1. **AUTENTICACIÓN Y USUARIOS**

#### Funcionalidades:
- ✅ Login con usuario y contraseña
- ✅ Verificación con JWT (24 horas de validez)
- ✅ Gestión de roles de usuario
- ✅ Refresh de tokens
- ✅ Creación, lectura, actualización y eliminación de usuarios
- ✅ Reporte de actividad de usuarios
- ✅ Monitoreo de último acceso

#### Endpoints API:
```
POST   /api/login                          → Autenticar usuario
POST   /api/refresh-token                  → Renovar token JWT
GET    /api/lastActive                     → Último acceso del usuario
POST   /api/users                          → Crear usuario
GET    /api/users                          → Listar usuarios
GET    /api/users/[id]                     → Obtener usuario específico
PUT    /api/users/[id]                     → Actualizar usuario
DELETE /api/users/[id]                     → Eliminar usuario
GET    /api/reports/user-activity          → Reporte de actividad
```

#### Modelos/Tablas:
- **Users:** id, name, email, password, role, createdAt, updatedAt

---

### 2. **GESTIÓN DE CLIENTES**

#### Funcionalidades:
- ✅ Crear nuevos clientes
- ✅ Actualizar información de clientes
- ✅ Eliminar clientes
- ✅ Buscar clientes por nombre o criterios
- ✅ Ver lista de todos los clientes
- ✅ Asociar precios especiales por cliente
- ✅ Gestión de dirección y contactos
- ✅ Historial de interacciones

#### Endpoints API:
```
POST   /api/clients                        → Crear cliente
GET    /api/clients                        → Listar clientes
GET    /api/clients/[id]                   → Obtener cliente específico
PUT    /api/clients/[id]                   → Actualizar cliente
DELETE /api/clients/[id]                   → Eliminar cliente
GET    /api/clients/search                 → Buscar cliente
GET    /api/clients/namesPhones            → Obtener nombres y teléfonos
POST   /api/client-prices                  → Gestionar precios por cliente
```

#### Modelos/Tablas:
- **Clients:** uuid, fullName, companyName, businessTurn, address, contactName, email, phone, website, sector, revenue, createdAt, updatedAt
- **ClientPrices:** clientId, productId, customPrice

---

### 3. **GESTIÓN DE PRODUCTOS Y CATÁLOGO**

#### Funcionalidades:
- ✅ Crear productos
- ✅ Actualizar información de productos
- ✅ Listar todos los productos
- ✅ Eliminar productos
- ✅ Buscar por nombre/categoría
- ✅ Gestión de precios
- ✅ Gestión de inventario
- ✅ Visualización en catálogo

#### Endpoints API:
```
POST   /api/products                       → Crear producto
GET    /api/products                       → Listar productos
GET    /api/products/[id]                  → Obtener producto
PUT    /api/products/[id]                  → Actualizar producto
DELETE /api/products/[id]                  → Eliminar producto
```

#### Modelos/Tablas:
- **Products:** uuid, name, category, description, price, stock, supplier, createdAt, updatedAt

---

### 4. **GESTIÓN DE VENTAS**

#### Funcionalidades:
- ✅ Crear venta (registro de transacción)
- ✅ Actualizar estado de ventas
- ✅ Listar todas las ventas
- ✅ Ver detalles de venta
- ✅ Eliminación de ventas
- ✅ Generación de tabla de ventas
- ✅ Cálculo de comisiones
- ✅ Filtrado por fecha/vendedor/cliente

#### Endpoints API:
```
POST   /api/sales                          → Crear venta
GET    /api/sales                          → Listar ventas
GET    /api/sales/[id]                     → Obtener venta
PUT    /api/sales/[id]                     → Actualizar venta
DELETE /api/sales/[id]                     → Eliminar venta
GET    /api/sales/salestabla               → Tabla de ventas
```

#### Modelos/Tablas:
- **Sales:** uuid, clientId, sellerId, productId, quantity, totalPrice, status, date, notes, createdAt, updatedAt
- **SalesReport:** ventasId, reportData, date

---

### 5. **COTIZACIONES Y PRESUPUESTOS**

#### Funcionalidades (Tres tipos de cotizaciones):

**A. Cotizaciones Estándar:**
- ✅ Crear cotizaciones personalizadas
- ✅ Gestión de ítems en cotización
- ✅ Cálculo de totales con impuestos
- ✅ Generación de PDF
- ✅ Envío por email
- ✅ Estado de cotización (pendiente, aprobada, rechazada)

**B. Cotizaciones SANO:**
- ✅ Formulario especializado para producto SANO
- ✅ Cálculo de costos específicos
- ✅ Gestión de presupuestos SANO

**C. Cotizaciones Manuales/Quotation:**
- ✅ Gestión de quotes generales
- ✅ Tracking de seguimiento

#### Endpoints API:
```
POST   /api/quotations                     → Crear cotización
GET    /api/quotations                     → Listar cotizaciones
GET    /api/quotations/[id]                → Obtener cotización
PUT    /api/quotations/[id]                → Actualizar cotización
DELETE /api/quotations/[id]                → Eliminar cotización
POST   /api/quotes                         → Crear quote
GET    /api/quotes                         → Listar quotes
GET    /api/quotes/[id]                    → Obtener quote
PUT    /api/quotes/[id]                    → Actualizar quote
DELETE /api/quotes/[id]                    → Eliminar quote
```

#### Modelos/Tablas:
- **Quotation:** uuid, clientId, items[], totalPrice, tax, status, validUntil, createdAt, updatedAt
- **Quote:** uuid, clientId, details, status, createdAt, updatedAt
- **Sano Quotation:** Especializada para productos SANO

---

### 6. **SOLUCITUD DE CRÉDITO**

#### Funcionalidades:
- ✅ Crear solicitud de crédito
- ✅ Validar información del cliente
- ✅ Gestión de documentación
- ✅ Aprobación/Rechazo de solicitudes
- ✅ Seguimiento de estado
- ✅ Reporte de créditos

#### Endpoints API:
```
POST   /api/credits                        → Crear solicitud de crédito
GET    /api/credits                        → Listar solicitudes
PUT    /api/credits/[id]                   → Actualizar solicitud
DELETE /api/credits/[id]                   → Eliminar solicitud
```

#### Modelos/Tablas:
- **CreditRequest:** uuid, clientId, amount, purpose, status, requestDate, approvalDate

---

### 7. **COBRANZA Y CUENTAS POR COBRAR**

#### Funcionalidades:
- ✅ Gestión de cuentas por cobrar
- ✅ Seguimiento de pagos pendientes
- ✅ Registro de cobranzas
- ✅ Historial de pagos
- ✅ Generación de reportes de cobranza
- ✅ Carga de archivo de Microsip (integración)
- ✅ Alertas de mora

#### Endpoints API:
```
POST   /api/cobranza                       → Registrar cobranza
GET    /api/cobranza                       → Listar cobranzas
POST   /api/cobranza/upload                → Cargar archivo de cobranza
POST   /api/microsip/cobranza-upload       → Carga desde Microsip
```

#### Modelos/Tablas:
- **AccountsReceivable:** uuid, clientId, amount, dueDate, status, lastPaymentDate
- **MicrosipSalesModel:** Integración de datos de Microsip

---

### 8. **REPORTES Y ANÁLITICA**

#### Tipos de Reportes:

**A. Reportes de Ventas:**
- ✅ Reporte por vendedor
- ✅ Reporte por período (semanal, mensual)
- ✅ Reporte por producto
- ✅ Reporte por cliente
- ✅ Análisis de tendencias

**B. Reportes de Negocio por Unidad:**
- ✅ Performance por unidad de negocio
- ✅ Gráficos de desempeño
- ✅ Comparativas entre unidades
- ✅ Proyecciones de ventas

**C. Reportes de Desempeño:**
- ✅ KPI de vendedores
- ✅ Seguimiento de metas
- ✅ Análisis comparativo
- ✅ Indicadores de productividad

**D. Reportes de Actividad de Usuarios:**
- ✅ Última actividad
- ✅ Horas de conexión
- ✅ Acciones realizadas

#### Endpoints API:
```
GET    /api/reports/user-activity          → Actividad de usuarios
GET    /api/reports/performance            → Reporte de desempeño
GET    /api/business-units/reports         → Reporte de unidades
```

#### Gráficos Disponibles:
- 📊 Gráficos de barras (Chart.js, Recharts)
- 📈 Gráficos de línea
- 🥧 Gráficos de pastel
- 📉 Gráficos de área

---

### 9. **GESTIÓN DE PROSPECTOS**

#### Funcionalidades:
- ✅ Crear prospecto (pre-cliente)
- ✅ Seguimiento de estado del prospecto
- ✅ Historial de interacciones
- ✅ Cambio de estado (Nuevo, Contactado, Calificado, Propuesta, Cerrado)
- ✅ Asignación a vendedor
- ✅ Notas y comentarios
- ✅ Conversión a cliente

#### Endpoints API:
```
POST   /api/prospects                      → Crear prospecto
GET    /api/prospects                      → Listar prospectos
GET    /api/prospects/[id]                 → Obtener prospecto
PUT    /api/prospects/[id]                 → Actualizar prospecto
DELETE /api/prospects/[id]                 → Eliminar prospecto
```

#### Modelos/Tablas:
- **Prospect:** uuid, companyName, contactName, email, phone, source, status, assignedTo, createdAt, updatedAt
- **ProspectStatusHistory:** prospectId, oldStatus, newStatus, changeDate

---

### 10. **UNIDADES DE NEGOCIO**

#### Funcionalidades:
- ✅ Crear unidades de negocio
- ✅ Gestionar unidades
- ✅ Asignar vendedores a unidades
- ✅ Reporte de desempeño por unidad
- ✅ Gráficas de rendimiento
- ✅ Descripción y objetivos

#### Endpoints API:
```
POST   /api/business-units                 → Crear unidad
GET    /api/business-units                 → Listar unidades
GET    /api/business-units/[id]            → Obtener unidad
PUT    /api/business-units/[id]            → Actualizar unidad
DELETE /api/business-units/[id]            → Eliminar unidad
GET    /api/business-units/reports         → Reporte de unidad
POST   /api/business-graficas              → Gráficas por unidad
```

#### Modelos/Tablas:
- **BusinessUnit:** uuid, name, description, totalRevenue, createdAt, updatedAt
- **BusinessUnitReport:** unitId, reportData, month

---

### 11. **SERVICIOS**

#### Funcionalidades:
- ✅ Crear servicios
- ✅ Actualizar servicios
- ✅ Listar servicios
- ✅ Asociar servicios a clientes
- ✅ Descripción y precios
- ✅ Duración estimada

#### Endpoints API:
```
POST   /api/servicios                      → Crear servicio
GET    /api/servicios                      → Listar servicios
GET    /api/servicios/[id]                 → Obtener servicio
PUT    /api/servicios/[id]                 → Actualizar servicio
DELETE /api/servicios/[id]                 → Eliminar servicio
```

#### Modelos/Tablas:
- **Servicio:** uuid, name, description, price, duration, category, createdAt, updatedAt

---

### 12. **CHAT Y COMUNICACIÓN**

#### Funcionalidades:
- ✅ Sistema de chat en tiempo real
- ✅ Mensajes entre usuarios
- ✅ Integración con Socket.io
- ✅ Historial de conversaciones
- ✅ Notificaciones de nuevos mensajes

#### Funcionalidades Especiales:
- ✅ Envío de mensajes por WhatsApp/Email (integración)

#### Modelos/Tablas:
- **Message:** uuid, senderId, recipientId, content, timestamp, isRead

---

### 13. **INCIDENCIAS Y SOPORTE**

#### Funcionalidades:
- ✅ Crear incidencia/ticket de soporte
- ✅ Asignar a personal de soporte
- ✅ Cambio de estado (Abierta, En proceso, Resuelta, Cerrada)
- ✅ Prioridad (Baja, Media, Alta, Crítica)
- ✅ Categorización
- ✅ Seguimiento de incidencias

#### Endpoints API:
```
POST   /api/incidents                      → Crear incidencia
GET    /api/incidents                      → Listar incidencias
PUT    /api/incidents/[id]                 → Actualizar incidencia
DELETE /api/incidents/[id]                 → Eliminar incidencia
```

#### Modelos/Tablas:
- **Incident:** uuid, title, description, status, priority, assignedTo, createdAt, updatedAt

---

### 14. **GESTIÓN DE ARCHIVOS**

#### Funcionalidades:
- ✅ Cargar archivos (Excel, PDF, documentos)
- ✅ Almacenamiento en Cloudinary
- ✅ Listar archivos por tipo/cliente
- ✅ Descargar archivos
- ✅ Eliminar archivos
- ✅ Versionado de documentos
- ✅ Integración con Microsip (carga de datos)

#### Endpoints API:
```
POST   /api/upload                         → Cargar archivo
POST   /api/files                          → Guardar referencia de archivo
GET    /api/files                          → Listar archivos
GET    /api/files/[id]                     → Obtener archivo
DELETE /api/files/[id]                     → Eliminar archivo
POST   /api/microsip/bulk-upload           → Carga masiva desde Microsip
```

#### Modelos/Tablas:
- **Files:** uuid, fileName, fileUrl, fileType, uploadedBy, uploadDate, clientId

---

### 15. **MARKETING**

#### Funcionalidades:
- ✅ Gestión de archivos de marketing
- ✅ Catálogo de materiales
- ✅ Distribución de contenido

#### Endpoints API:
```
POST   /api/mktfiles                       → Crear archivo marketing
GET    /api/mktfiles                       → Listar archivos
GET    /api/mktfiles/[id]                  → Obtener archivo
DELETE /api/mktfiles/[id]                  → Eliminar archivo
```

#### Modelos/Tablas:
- **MktFile:** uuid, fileName, category, description, fileUrl

---

### 16. **CALENDARIO Y CITAS**

#### Funcionalidades:
- ✅ Crear citas/eventos
- ✅ Calendario visual (React Calendar)
- ✅ Reminders automáticos
- ✅ Asociar citas a clientes/prospectos
- ✅ Control de disponibilidad

#### Endpoints API:
```
POST   /api/appointments                   → Crear cita
GET    /api/appointments                   → Listar citas
GET    /api/appointments/[id]              → Obtener cita
PUT    /api/appointments/[id]              → Actualizar cita
DELETE /api/appointments/[id]              → Eliminar cita
```

#### Modelos/Tablas:
- **Appointment:** uuid, clientId, title, date, time, description, status, createdAt, updatedAt

---

### 17. **QR CODE READER**

#### Funcionalidades:
- ✅ Lectura de códigos QR
- ✅ Escaneo en tiempo real (html5-qrcode)
- ✅ Procesamiento de datos QR
- ✅ Integración con flujos de negocio

---

### 18. **EXPORTACIÓN Y GENERACIÓN DE DOCUMENTOS**

#### Funcionalidades:
- ✅ Exportar a PDF (jsPDF, jsPDF-autotable)
- ✅ Exportar a Excel (XLSX)
- ✅ Generación de reportes
- ✅ Impresión de documentos
- ✅ Generación de cotizaciones en PDF

#### Tecnologías Usadas:
- jsPDF para PDFs
- XLSX para Excel
- PapaParse para CSV

---

### 19. **INTEGRACIONES EXTERNAS**

#### Cloudinary:
- ✅ Almacenamiento de imágenes
- ✅ Gestión de archivos en la nube
- ✅ URLs de archivos

#### Microsip:
- ✅ Integración de datos de ventas
- ✅ Carga de información de cobranza
- ✅ Sincronización de productos

#### Email:
- ✅ Envío de cotizaciones por email
- ✅ Envío de reportes
- ✅ Notificaciones automáticas
- ✅ Confirmación de citas

---

## 🎨 Componentes de Frontend

### Páginas Principales:
1. **Login** (`/login`) - Autenticación
2. **Dashboard** (`/dashboard`) - Panel principal con KPIs
3. **Clientes** (`/clientes`) - Gestión de clientes
4. **Ventas** (`/ventas`) - Registro de ventas
5. **Cotizaciones** (`/cotizacion`) - Crear cotizaciones
6. **Cotización SANO** (`/cotizacionsano`) - Especializado
7. **Productos** (`/productos`) - Catálogo de productos
8. **Prospectos** (`/prospectos`) - Gestión de prospectos
9. **Cobranza** (`/cobranza`) - Seguimiento de cobros
10. **Créditos** (`/creditos`) - Solicitudes de crédito
11. **Reportes** (`/reportes`) - Reportes de ventas
12. **Reportes Gráficos** (`/graficas-reportes`) - Visualización
13. **Reportes Unidad Negocio** (`/reportes-unidad-negocio`)
14. **Reporte Mensual** (`/reporte-mensual`)
15. **Usuarios** (`/user`) - Gestión de usuarios
16. **Incidencias** (`/incidencias`) - Tickets de soporte
17. **Servicios** (`/servicios`) - Gestión de servicios
18. **Chat** (`/chat`) - Comunicación en tiempo real
19. **Calendario** (`/calendario`) - Gestión de citas
20. **Cartera Disponible** (`/cartera-disponible`) - Inventario
21. **Archivos** (`/archivos`) - Gestión de documentos
22. **QR** (`/qr`) - Lector de QR
23. **Marketing** (`/mkt`) - Archivos de marketing
24. **Vendedores** (`/vendedor`) - Gestión de vendedores

### Componentes React:
- **CreateClient** - Formulario para crear cliente
- **ClientList** - Listado de clientes
- **ClientPrices** - Precios especiales por cliente
- **CreateQuote** - Crear cotización
- **SanoQuotationForm** - Formulario especializado SANO
- **ProductCatalog** - Catálogo de productos
- **ProspectList** - Listado de prospectos
- **VentasComponents** - Componentes de ventas
- **BusinessUnitGraphs** - Gráficas de unidades
- **BusinessUnitReports** - Reportes de unidades
- **PerformanceMonitor** - Monitor de desempeño
- **UserActivityReport** - Reporte de actividad de usuarios
- **ExcelBarChart** - Gráficos desde Excel
- **QRCodeReader** - Lector de QR
- **CalendarCard** - Calendario
- **FileUploadWithSendEmail** - Carga y envío por email
- **MicrosipUpload** - Carga de datos Microsip
- **SendMessageForm** - Formulario de mensajes
- **ThemeToggle** - Alternancia de tema

---

## 🛡️ Autenticación y Seguridad

- **JWT:** Tokens con expiración de 24 horas
- **Contraseñas:** Hash con bcryptjs
- **Middleware:** `withAuth.js` para proteger rutas
- **Roles:** Sistema de roles para control de acceso
- **Variables de Entorno:** JWT_SECRET en .env

---

## 📊 Base de Datos

### Modelos Principales:
- Users
- Clients
- ClientPrices
- Products
- Sales
- SalesReport
- Quotation
- Quote
- CreditRequest
- AccountsReceivable
- Prospect
- ProspectStatusHistory
- BusinessUnit
- BusinessUnitReport
- Servicio
- Message
- Incident
- Files
- MktFile
- Appointment
- Event
- TrafficLight
- CompanyModel
- SalesBusinessModel

---

## 🔌 API Routes Structure

```
/api/
├── login                           → POST (Autenticación)
├── refresh-token                   → POST (Renovar JWT)
├── lastActive                      → GET (Último acceso)
├── upload                          → POST (Cargar archivos)
├── users/
│   ├── index                      → GET, POST, PUT, DELETE
│   └── [id]                       → GET, PUT, DELETE
├── clients/
│   ├── index                      → GET, POST
│   ├── [id]                       → GET, PUT, DELETE
│   ├── search                     → GET (Búsqueda)
│   └── namesPhones                → GET
├── products/
│   ├── index                      → GET, POST
│   └── [id]                       → GET, PUT, DELETE
├── sales/
│   ├── index                      → GET, POST, PUT, DELETE
│   └── salestabla                 → GET
├── quotes/
│   ├── index                      → GET, POST
│   └── [id]                       → GET, PUT, DELETE
├── quotations/
│   ├── index                      → GET, POST
│   └── [id]                       → GET, PUT, DELETE
├── credits/
│   └── index                      → GET, POST, PUT, DELETE
├── cobranza/
│   ├── index                      → GET, POST
│   └── upload                     → POST
├── prospects/
│   ├── index                      → GET, POST
│   └── [id]                       → GET, PUT, DELETE
├── business-units/
│   ├── index                      → GET, POST
│   ├── [id]                       → GET, PUT, DELETE
│   └── reports                    → GET
├── servicios/
│   ├── index                      → GET, POST
│   └── [id]                       → GET, PUT, DELETE
├── incidents/
│   └── index                      → GET, POST, PUT, DELETE
├── files/
│   ├── index                      → GET, POST
│   └── [id]                       → GET, DELETE
├── client-prices/
│   └── index                      → GET, POST
├── appointments/
│   ├── index                      → GET, POST
│   └── [id]                       → GET, PUT, DELETE
├── mktfiles/
│   ├── index                      → GET, POST
│   └── [id]                       → GET, DELETE
├── email/
│   └── send-file-email           → POST
├── reports/
│   ├── user-activity             → GET
│   └── performance               → GET
├── business-graficas/
│   ├── index                     → GET, POST
│   └── [id]                      → GET, DELETE
├── salesbussines/
│   ├── index                     → GET, POST
│   └── [id]                      → GET, DELETE
└── microsip/
    ├── bulk-upload               → POST
    └── cobranza-upload           → POST
```

---

## 🎯 Flujos de Negocio Principales

### 1. Flujo de Venta Completo
```
Prospecto → Cliente → Cotización → Venta → Cobranza → Cierre
```

### 2. Flujo de Crédito
```
Solicitud → Validación → Aprobación → Desembolso → Seguimiento
```

### 3. Flujo de Reporte
```
Datos → Procesamiento → Análisis → Visualización → Exportación
```

---

## 📈 Características Avanzadas

### Análitica y BI:
- ✅ KPIs en tiempo real
- ✅ Gráficos dinámicos
- ✅ Comparativas de período
- ✅ Proyecciones de ventas
- ✅ Análisis de tendencias

### Automatizaciones:
- ✅ Envío automático de reportes
- ✅ Alertas de mora
- ✅ Recordatorios de citas
- ✅ Sincronización con Microsip
- ✅ Notificaciones por email

### Inteligencia de Negocio:
- ✅ Semáforo de tráfico (TrafficLightModel)
- ✅ Indicadores de desempeño
- ✅ Análisis de productos
- ✅ Segmentación de clientes

---

## 🔧 Configuración y Deployment

### Variables de Entorno Requeridas:
```
JWT_SECRET=<tu_secret_jwt>
DATABASE_URL=<tu_conexion_mysql>
CLOUDINARY_CLOUD_NAME=<tu_cloud_name>
CLOUDINARY_API_KEY=<tu_api_key>
CLOUDINARY_API_SECRET=<tu_api_secret>
EMAIL_USER=<tu_email>
EMAIL_PASSWORD=<tu_contraseña>
```

### Scripts Disponibles:
```bash
npm run dev      → Ejecutar en modo desarrollo
npm run build    → Compilar para producción
npm start        → Ejecutar en producción
npm run lint     → Validar código
```

---

## 📝 Modelos de Datos (Sequelize)

Todas las tablas incluyen:
- `uuid` - Identificador único (UUIDV4)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

Las relaciones se definen mediante foreign keys y asociaciones.

---

## 🚀 Tecnologías Utilizadas

| Categoría | Tecnología |
|-----------|-----------|
| Frontend | Next.js 16, React 19 |
| UI Framework | Tailwind CSS, Material Tailwind |
| Backend | Node.js, Next.js API Routes |
| Base de Datos | MySQL, Sequelize ORM |
| Autenticación | JWT (jsonwebtoken) |
| Criptografía | bcryptjs |
| Almacenamiento Cloud | Cloudinary |
| Reportes | jsPDF, XLSX |
| Gráficos | Chart.js, Recharts |
| Comunicación | Socket.io |
| Upload | Multer, Formidable |
| Email | Nodemailer |
| QR Code | html5-qrcode |
| Utilidades | date-fns, UUID, Papa Parse |

---

## 📧 Contacto y Soporte

Para más información sobre características específicas, consulta los componentes y modelos en:
- `/src/components/` - Componentes React
- `/src/models/` - Modelos de Base de Datos
- `/src/pages/api/` - Endpoints API
- `/src/pages/` - Páginas principales

---

**Última actualización:** Mayo 2026  
**Estado:** Documentación Completa ✅
