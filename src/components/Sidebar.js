import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Sidebar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        setUserEmail(decoded.email);
        console.log("User email:", decoded.email);
      } catch (error) {
        console.error('Error decoding token:', error);
      } finally {
        setLoading(false); 
      }
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

 // Definir accesos basados en el correo electrónico
 const canViewReportesUnidadNegocio = [ ''].includes(userEmail);
 const canViewReportesMensuales = userEmail === 'direccion@grupomrlaguna.com';
 const canViewCotizaciones = ['mgaliano@grupomrlaguna.com', 'Hdelbosque@grupomrlaguna.com', 'luispatino@grupomrlaguna.com', 'gustavosalgado@grupomrlaguna.com'].includes(userEmail);
 const canViewServicios = ['direccion@grupomrlaguna.com', 'mgaliano@grupomrlaguna.com'].includes(userEmail);
 const canViewClientes = ['direccion@grupomrlaguna.com', 'mgaliano@grupomrlaguna.com', 'Hdelbosque@grupomrlaguna.com', 'luispatino@grupomrlaguna.com', 'gustavosalgado@grupomrlaguna.com'].includes(userEmail);
 const canViewCreditos = ['mgaliano@grupomrlaguna.com', 'Hdelbosque@grupomrlaguna.com', 'gustavosalgado@grupomrlaguna.com'].includes(userEmail);
 const canViewCalendario = ['mgaliano@grupomrlaguna.com', 'Hdelbosque@grupomrlaguna.com', 'gustavosalgado@grupomrlaguna.com', 'luispatino@grupomrlaguna.com'].includes(userEmail);
 const canViewChat = ['mgaliano@grupomrlaguna.com', 'Hdelbosque@grupomrlaguna.com', 'gustavosalgado@grupomrlaguna.com', 'luispatino@grupomrlaguna.com'].includes(userEmail);
 const canViewIncidencias = ['mgaliano@grupomrlaguna.com', 'Hdelbosque@grupomrlaguna.com', 'gustavosalgado@grupomrlaguna.com', 'luispatino@grupomrlaguna.com'].includes(userEmail);
 const hasTotalAccess = userEmail === 'coordinadora@grupomrlaguna.com';
 const canViewAsesores = ['direccion@grupomrlaguna.com', 'coordinadora@grupomrlaguna.com'].includes(userEmail); 

 console.log('Acceso a Asesores:', canViewAsesores, hasTotalAccess); // Debugging

 

  return (
    <aside className={`${isCollapsed ? 'w-11' : 'w-64'} bg-[#1f2937] p-5 transition-all duration-300 min-h-screen relative`}>
      <div className="absolute top-10 left-2">
        <button onClick={toggleSidebar} className="text-white focus:outline-none text-3xl">
          {isCollapsed ? <FiMenu /> : <FiX />}
        </button>
      </div>
      <div className="flex items-center justify-center mb-8 mt-12">
        {!isCollapsed && (
          <Link href="/dashboard">
            <img src="/logo_mr.png" alt="Logo" className="h-10" />
          </Link>
        )}
      </div>
      <nav className="mt-10">
        <ul className="mt-4">
        {(canViewAsesores || hasTotalAccess) && (
        <li className="mb-4">
              <Link href="/user" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Asesores Comerciales'}
              </Link>
            </li>
          )}
        {(hasTotalAccess) && (
        <li className="mb-4">
              <Link href="/reportes-unidad-negocio" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Unidad de Negocio'}
              </Link>
            </li>
          )}

        {(canViewReportesUnidadNegocio || canViewReportesMensuales   || hasTotalAccess) && (
        <li className="mb-4">
              <Link href="/reporte-mensual" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Reporte Mensual'}
              </Link>
            </li>
          )}
          {(canViewCalendario || hasTotalAccess) && (
            <li className="mb-4">
              <Link href="/calendario" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Calendario'}
              </Link>
            </li>
          )}
          {(canViewClientes || hasTotalAccess) && (
            <li className="mb-4">
              <Link href="/clientes" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Clientes'}
              </Link>
            </li>
          )}
          {(canViewServicios || hasTotalAccess) && (
            <li className="mb-4">
              <Link href="/servicios" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Servicios'}
              </Link>
            </li>
          )}
          {(canViewCreditos || hasTotalAccess) && (
            <li className="mb-4">
              <Link href="/creditos" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Créditos'}
              </Link>
            </li>
          )}
          {(canViewCreditos || hasTotalAccess) && (
            <li className="mb-4">
              <Link href="/cotizacionsano" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Créditos-sano'}
              </Link>
            </li>
          )}
          {(canViewCotizaciones || hasTotalAccess) && (
            <li className="mb-4">
              <Link href="/cotizacion" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Cotización'}
              </Link>
            </li>
          )}
            {(canViewCotizaciones || hasTotalAccess) && (
            <li className="mb-4">
              <Link href="/archivos" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'PDF'}
              </Link>
            </li>
          )}
          {(canViewIncidencias || hasTotalAccess) && (
            <li className="mb-4">
              <Link href="/incidencias" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Incidencias'}
              </Link>
            </li>
          )}
          {(canViewChat || hasTotalAccess) && (
            <li className="mb-4">
              <Link href="/chat" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Chat'}
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex items-center p-2 rounded hover:bg-[#374151] text-white w-full text-left"
        >
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
