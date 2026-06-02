# 📖 Manual de Usuario - GrupoMR CRM

## 🎯 Bienvenida

Este manual te ayudará a entender qué funciones puedes usar en la aplicación según tu rol. Cada usuario tiene permisos específicos diseñados para optimizar tu trabajo.

---

## 👥 Roles en el Sistema

La aplicación tiene **3 roles principales** con funcionalidades diferenciadas:

1. **🔑 ADMINISTRADOR** - Acceso completo a toda la plataforma
2. **💼 GERENCIA** - Acceso a reportes y supervisión
3. **👔 VENDEDOR/ASESOR** - Acceso a funciones operativas

---

## 🔑 ADMINISTRADOR

El rol de **Administrador** tiene acceso COMPLETO a todas las funcionalidades del sistema.

### 📊 DASHBOARD Y INICIO
- ✅ Ver dashboard completo con todos los KPIs
- ✅ Ver gráficos de desempeño global
- ✅ Ver información de todas las unidades de negocio
- ✅ Acceder a reportes generales

**Ruta:** `/dashboard`

### 👤 GESTIÓN DE USUARIOS
- ✅ Ver lista de todos los usuarios
- ✅ Crear nuevos usuarios
- ✅ Asignar roles (Administrador, Gerencia, Vendedor)
- ✅ Editar información de usuarios
- ✅ Eliminar usuarios
- ✅ Ver último acceso de cada usuario
- ✅ Reporte de actividad de usuarios

**Ruta:** `/user`

### 👥 GESTIÓN DE CLIENTES
- ✅ Ver todos los clientes
- ✅ Crear nuevos clientes
- ✅ Editar información de clientes
- ✅ **Eliminar clientes**
- ✅ Buscar clientes
- ✅ Asignar precios especiales por cliente
- ✅ Ver historial de transacciones del cliente

**Ruta:** `/clientes`

### 📦 GESTIÓN DE PRODUCTOS
- ✅ Ver catálogo completo
- ✅ Crear nuevos productos
- ✅ Editar productos
- ✅ Eliminar productos
- ✅ Gestionar precios y stock
- ✅ Actualizar categorías

**Ruta:** `/productos`

### 💰 GESTIÓN DE VENTAS
- ✅ Ver todas las ventas del sistema
- ✅ Crear ventas
- ✅ Editar ventas
- ✅ **Eliminar ventas**
- ✅ Ver desglose por vendedor
- ✅ Acceder a toda la tabla de ventas
- ✅ Filtrar por período, vendedor, cliente

**Ruta:** `/ventas`

### 📄 GESTIÓN DE COTIZACIONES
- ✅ Ver todas las cotizaciones
- ✅ Crear cotizaciones estándar
- ✅ Crear cotizaciones SANO (especializado)
- ✅ Editar cotizaciones
- ✅ Eliminar cotizaciones
- ✅ Generar PDF de cotizaciones
- ✅ Enviar cotizaciones por email
- ✅ Ver estado de aprobación

**Rutas:** 
- `/cotizacion` - Cotizaciones estándar
- `/cotizacionsano` - Cotizaciones SANO

### 🎯 GESTIÓN DE PROSPECTOS
- ✅ Ver todos los prospectos
- ✅ Crear prospectos
- ✅ Editar prospectos
- ✅ **Eliminar prospectos**
- ✅ Asignar prospectos a vendedores
- ✅ Cambiar estado del prospecto
- ✅ Ver historial de cambios de estado

**Ruta:** `/prospectos`

### 💳 GESTIÓN DE CRÉDITOS
- ✅ Ver todas las solicitudes de crédito
- ✅ Crear solicitudes de crédito
- ✅ Aprobar/Rechazar créditos
- ✅ Seguimiento de créditos
- ✅ Historial de créditos

**Ruta:** `/creditos`

### 💸 COBRANZA Y CUENTAS POR COBRAR
- ✅ Ver todas las cuentas por cobrar
- ✅ Registrar cobranzas
- ✅ Cargar archivos de cobranza (Excel)
- ✅ Integración con Microsip
- ✅ Ver alertas de mora
- ✅ Historial de pagos

**Ruta:** `/cobranza`

### 📈 REPORTES Y ANALÍTICA
- ✅ Reporte general de ventas
- ✅ Reporte de desempeño (global)
- ✅ Reportes por unidad de negocio
- ✅ Reporte mensual
- ✅ Gráficas y visualizaciones
- ✅ Reporte de actividad de usuarios
- ✅ Exportar reportes a Excel/PDF

**Rutas:**
- `/reportes` - Reporte de ventas
- `/reportes2` - Reporte general
- `/graficas-reportes` - Visualizaciones
- `/reportes-unidad-negocio` - Por unidad
- `/reporte-mensual` - Mensual

### 🏢 UNIDADES DE NEGOCIO
- ✅ Ver todas las unidades
- ✅ Crear unidades de negocio
- ✅ Editar unidades
- ✅ Asignar vendedores a unidades
- ✅ Ver desempeño por unidad

**Ruta:** `/reportes-unidad-negocio`

### 🔧 SERVICIOS
- ✅ Ver todos los servicios
- ✅ Crear servicios
- ✅ Editar servicios
- ✅ Eliminar servicios
- ✅ Gestionar precios de servicios

**Ruta:** `/servicios`

### 🎫 INCIDENCIAS Y SOPORTE
- ✅ Ver todas las incidencias
- ✅ Crear incidencias
- ✅ Asignar a personal
- ✅ Cambiar prioridad y estado
- ✅ Resolver incidencias

**Ruta:** `/incidencias`

### 📁 GESTIÓN DE ARCHIVOS
- ✅ Ver todos los archivos
- ✅ Cargar archivos
- ✅ Descargar archivos
- ✅ Eliminar archivos
- ✅ Cargar datos desde Microsip

**Ruta:** `/archivos`

### 📅 CALENDARIO Y CITAS
- ✅ Ver todas las citas
- ✅ Crear citas
- ✅ Editar citas
- ✅ Eliminar citas
- ✅ Asignar citas a vendedores

**Ruta:** `/calendario`

### 💬 CHAT Y COMUNICACIÓN
- ✅ Enviar mensajes a cualquier usuario
- ✅ Ver historial completo
- ✅ Chat en tiempo real

**Ruta:** `/chat`

### 📱 OTROS
- ✅ Lector QR Code
- ✅ Marketing (gestión de archivos)
- ✅ Cartera disponible
- ✅ Ver datos de vendedores

**Rutas:** `/qr`, `/mkt`, `/cartera-disponible`, `/vendedor`

---

## 💼 GERENCIA

El rol de **Gerencia** es supervisión. Tiene acceso a reportes y puede ver todo pero tiene restricciones en eliminación.

### 📊 DASHBOARD
- ✅ Ver dashboard con KPIs generales
- ✅ Ver gráficos de desempeño
- ✅ Visualizar datos de unidades de negocio
- ✅ Acceder a reportes

**Ruta:** `/dashboard`

### 👥 GESTIÓN DE CLIENTES
- ✅ Ver todos los clientes
- ✅ Crear clientes
- ✅ Editar clientes
- ❌ NO puede eliminar clientes
- ✅ Buscar clientes
- ✅ Asignar precios especiales

**Ruta:** `/clientes`

### 💰 GESTIÓN DE VENTAS
- ✅ Ver todas las ventas
- ✅ Crear ventas
- ✅ Editar ventas
- ❌ NO puede eliminar ventas
- ✅ Ver desglose por vendedor
- ✅ Ver tabla completa de ventas

**Ruta:** `/ventas`

### 📄 GESTIÓN DE COTIZACIONES
- ✅ Ver todas las cotizaciones
- ✅ Crear cotizaciones
- ✅ Editar cotizaciones
- ❌ NO puede eliminar
- ✅ Generar PDF
- ✅ Enviar por email

**Rutas:** `/cotizacion`, `/cotizacionsano`

### 🎯 GESTIÓN DE PROSPECTOS
- ✅ Ver todos los prospectos
- ✅ Crear prospectos
- ✅ Editar prospectos
- ❌ NO puede eliminar
- ✅ Asignar a vendedores
- ✅ Ver historial

**Ruta:** `/prospectos`

### 📈 REPORTES Y ANALÍTICA
- ✅ Reporte general de ventas
- ✅ Reporte de desempeño (global)
- ✅ Reportes por unidad de negocio
- ✅ Reporte mensual
- ✅ Gráficas
- ✅ Exportar reportes

**Rutas:** `/reportes`, `/reportes2`, `/graficas-reportes`, `/reportes-unidad-negocio`, `/reporte-mensual`

### 🏢 UNIDADES DE NEGOCIO
- ✅ Ver unidades de negocio
- ✅ Ver desempeño por unidad
- ✅ Crear/Editar unidades
- ❌ NO puede eliminar

**Ruta:** `/reportes-unidad-negocio`

### 💸 COBRANZA
- ✅ Ver cuentas por cobrar
- ✅ Ver cobranzas realizadas
- ✅ Ver reportes de cobranza

**Ruta:** `/cobranza`

### 💳 CRÉDITOS
- ✅ Ver solicitudes de crédito
- ✅ Crear solicitudes
- ✅ Seguimiento

**Ruta:** `/creditos`

### 📊 OTROS ACCESOS
- ✅ Chat
- ✅ Calendario
- ✅ Incidencias
- ✅ Archivos (visualizar)
- ✅ Servicios (visualizar)

**Rutas:** `/chat`, `/calendario`, `/incidencias`, `/archivos`, `/servicios`

### ❌ RESTRICCIONES DE GERENCIA
- ❌ NO puede crear/editar/eliminar usuarios
- ❌ NO puede eliminar clientes, ventas, cotizaciones, prospectos
- ❌ NO puede eliminar productos
- ❌ NO puede eliminar incidencias
- ❌ NO tiene acceso a "Reporte General"

---

## 👔 VENDEDOR / ASESOR

El rol de **Vendedor** o **Asesor** es operativo. Acceso limitado a sus propias transacciones y gestión de clientes.

### 📊 DASHBOARD PERSONAL
- ✅ Ver dashboard con su rendimiento personal
- ✅ Ver gráficos de sus propias ventas
- ✅ Ver su desempeño individual
- ✅ Ver metas asignadas

**Ruta:** `/dashboard`

### 👥 GESTIÓN DE CLIENTES
- ✅ Ver todos los clientes
- ✅ Crear nuevos clientes
- ✅ Editar clientes (especialmente los que asignó)
- ❌ NO puede eliminar clientes
- ✅ Buscar clientes
- ✅ Ver historial de transacciones

**Ruta:** `/clientes`

### 💰 MIS VENTAS
- ✅ Ver **SOLO sus propias ventas**
- ✅ Crear ventas
- ✅ Editar sus propias ventas
- ❌ NO puede ver ventas de otros vendedores
- ❌ NO puede eliminar ventas
- ✅ Ver detalles de sus transacciones

**Ruta:** `/ventas`

### 📄 MIS COTIZACIONES
- ✅ Ver **SOLO sus propias cotizaciones**
- ✅ Crear cotizaciones estándar
- ✅ Crear cotizaciones SANO
- ✅ Editar sus cotizaciones
- ❌ NO puede ver cotizaciones de otros
- ❌ NO puede eliminar
- ✅ Generar PDF
- ✅ Enviar por email

**Rutas:** `/cotizacion`, `/cotizacionsano`

### 🎯 MIS PROSPECTOS
- ✅ Ver **SOLO sus prospectos asignados**
- ✅ Crear prospectos
- ✅ Editar sus prospectos
- ❌ NO puede ver prospectos de otros vendedores
- ❌ NO puede eliminar
- ✅ Cambiar estado del prospecto
- ✅ Convertir prospecto a cliente

**Ruta:** `/prospectos`

### 💳 SOLICITUDES DE CRÉDITO
- ✅ Ver **SOLO sus solicitudes de crédito**
- ✅ Crear solicitudes
- ✅ Seguimiento de sus solicitudes
- ❌ NO puede ver solicitudes de otros vendedores
- ❌ NO puede aprobar/rechazar

**Ruta:** `/creditos`

### 📈 REPORTES
- ✅ Ver su reporte de desempeño personal
- ✅ Ver sus propias ventas
- ✅ Exportar su información
- ❌ NO puede ver reportes globales
- ❌ NO puede ver datos de otros vendedores

**Ruta:** `/reportes`

### 📅 CITAS Y CALENDARIO
- ✅ Ver **SOLO sus citas asignadas**
- ✅ Crear citas
- ✅ Editar sus citas
- ❌ NO puede ver citas de otros
- ❌ NO puede asignar citas a otros vendedores

**Ruta:** `/calendario`

### 💬 CHAT
- ✅ Enviar mensajes a otros usuarios
- ✅ Comunicación en tiempo real
- ✅ Ver conversaciones

**Ruta:** `/chat`

### 📁 ARCHIVOS
- ✅ Ver archivos públicos
- ✅ Cargar archivos propios
- ✅ Descargar archivos
- ❌ NO puede eliminar archivos

**Ruta:** `/archivos`

### 📱 OTROS
- ✅ Lector QR
- ✅ Ver servicios
- ✅ Ver catálogo de productos
- ✅ Ver información de unidades de negocio

**Rutas:** `/qr`, `/servicios`, `/productos`, `/reportes-unidad-negocio`

### ❌ RESTRICCIONES DE VENDEDOR
- ❌ NO puede acceder a gestión de usuarios
- ❌ NO puede ver ventas/cotizaciones/prospectos de otros vendedores
- ❌ NO puede eliminar registros
- ❌ NO puede crear productos
- ❌ NO puede crear incidencias (solo reportarlas)
- ❌ NO puede ver todos los reportes generales
- ❌ NO puede gestionar unidades de negocio
- ❌ NO puede acceder a "Reporte General"

---

## 🔄 Matriz de Acceso Rápida

| Funcionalidad | Admin | Gerencia | Vendedor |
|---|:---:|:---:|:---:|
| **USUARIOS** | | | |
| Ver usuarios | ✅ | ❌ | ❌ |
| Crear usuarios | ✅ | ❌ | ❌ |
| Editar usuarios | ✅ | ❌ | ❌ |
| Eliminar usuarios | ✅ | ❌ | ❌ |
| | | | |
| **CLIENTES** | | | |
| Ver todos | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | ✅ |
| Eliminar | ✅ | ❌ | ❌ |
| | | | |
| **PRODUCTOS** | | | |
| Ver catálogo | ✅ | ✅ | ✅ |
| Crear | ✅ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ |
| | | | |
| **VENTAS** | | | |
| Ver todas | ✅ | ✅ | Sus propias |
| Crear | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | Sus propias |
| Eliminar | ✅ | ❌ | ❌ |
| | | | |
| **COTIZACIONES** | | | |
| Ver todas | ✅ | ✅ | Sus propias |
| Crear | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | Sus propias |
| Eliminar | ✅ | ❌ | ❌ |
| | | | |
| **PROSPECTOS** | | | |
| Ver todos | ✅ | ✅ | Sus asignados |
| Crear | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | Sus propios |
| Eliminar | ✅ | ❌ | ❌ |
| Asignar | ✅ | ✅ | ❌ |
| | | | |
| **CRÉDITOS** | | | |
| Ver todos | ✅ | ✅ | Sus propios |
| Crear | ✅ | ✅ | ✅ |
| Aprobar | ✅ | ❌ | ❌ |
| | | | |
| **COBRANZA** | | | |
| Ver todas | ✅ | ✅ | ❌ |
| Registrar | ✅ | ✅ | ❌ |
| | | | |
| **REPORTES** | | | |
| Reportes globales | ✅ | ✅ | ❌ |
| Reportes personales | ✅ | ✅ | ✅ |
| Exportar | ✅ | ✅ | ✅ |
| | | | |
| **INCIDENCIAS** | | | |
| Ver todas | ✅ | ✅ | ❌ |
| Crear | ✅ | ✅ | ❌ |
| Resolver | ✅ | ✅ | ❌ |
| | | | |
| **ARCHIVOS** | | | |
| Cargar | ✅ | ✅ | ✅ |
| Ver | ✅ | ✅ | ✅ |
| Descargar | ✅ | ✅ | ✅ |
| Eliminar | ✅ | ❌ | ❌ |
| | | | |
| **CALENDARIO** | | | |
| Ver todas | ✅ | ✅ | Sus propias |
| Crear | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | Sus propias |
| Eliminar | ✅ | ✅ | Sus propias |
| | | | |
| **CHAT** | | | |
| Acceso | ✅ | ✅ | ✅ |
| | | | |
| **OTROS** | | | |
| Unidades de negocio | ✅ | ✅ | Solo vista |
| Servicios | ✅ | ✅ | Solo vista |
| Marketing | ✅ | ✅ | ❌ |
| QR Reader | ✅ | ✅ | ✅ |

---

## 🎓 Guías Rápidas por Rol

### Para ADMINISTRADORES
1. **Primeras configuraciones:** Crear usuarios, configurar unidades de negocio, crear productos
2. **Supervisión:** Verificar reportes, monitorear vendedores, gestionar créditos
3. **Mantenimiento:** Gestionar archivos, actualizar precios, resolver incidencias

### Para GERENCIA
1. **Supervisión:** Revisar reportes de ventas, desempeño por unidad
2. **Seguimiento:** Monitorear prospectos, créditos y cobranza
3. **Análisis:** Generar reportes, exportar datos, visualizar gráficas

### Para VENDEDORES
1. **Operaciones diarias:** Crear clientes, registrar ventas, crear cotizaciones
2. **Seguimiento:** Gestionar prospectos, calendario de citas, chat con clientes
3. **Reportes personales:** Ver su desempeño, exportar sus datos

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo cambiar mi rol?**  
R: No, solo el Administrador puede cambiar roles de usuarios.

**P: ¿Puedo ver datos de otros vendedores?**  
R: Depende de tu rol. Los Administradores y Gerencia sí pueden. Los Vendedores solo ven sus propios datos.

**P: ¿Se puede recuperar un registro eliminado?**  
R: Contacta al Administrador del sistema. Se pueden recuperar desde las copias de seguridad.

**P: ¿Por qué no veo ciertos botones?**  
R: Tus permisos de rol no incluyen esa acción. Contacta a Administración si necesitas acceso.

**P: ¿Cómo reporto un problema?**  
R: Crea una incidencia desde `/incidencias` y describe el problema detalladamente.

---

## 📞 Soporte

Si tienes preguntas sobre tus permisos o acceso:
- Contacta al Administrador del sistema
- Crea una incidencia desde la sección de Incidencias
- Usa el chat para comunicación rápida

---

**Última actualización:** Mayo 2026  
**Manual de Usuario - GrupoMR CRM** ✅
