import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Sidebar() {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !userRole) { // Solo decodifica si no tenemos ya el role del usuario
      try {
        const decoded = jwt.decode(token);
        setUserRole(decoded.role);
        setUserEmail(decoded.email);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [userRole]);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const canViewAsesores = ['admin', 'gerencia', 'direccion', 'coordinador'].includes(userRole);
  const canViewCotizaciones = userRole === 'coordinador' || userEmail === 'Hdelbosque@grupomrlaguna.com';
  const canViewReportesUnidadNegocio = ['direccion', 'coordinador', 'gerencia'].includes(userRole);
  const canViewReportesMensuales = userRole === 'direccion' || userRole === 'coordinador';
  const canViewServicios = ['direccion', 'coordinador', 'gerencia', userEmail === 'mgaliano@grupomrlaguna.com'].includes(userRole);
  const canViewClientes = ['direccion', 'coordinador', 'vendedor', userEmail === 'mgaliano@grupomrlaguna.com', userEmail === 'Hdelbosque@grupomrlaguna.com'].includes(userRole);
  const canViewCreditos = ['gerencia', 'coordinador', userEmail === 'mgaliano@grupomrlaguna.com', userEmail === 'Hdelbosque@grupomrlaguna.com'].includes(userRole);
  const canViewCalendario = ['gerencia', 'vendedor', 'coordinador', userEmail === 'mgaliano@grupomrlaguna.com', userEmail === 'Hdelbosque@grupomrlaguna.com'].includes(userRole);
  const canViewChat = ['gerencia', 'vendedor', 'coordinador'].includes(userRole);
  const canViewIncidencias = ['gerencia', 'vendedor', 'coordinador', userEmail === 'mgaliano@grupomrlaguna.com', userEmail === 'Hdelbosque@grupomrlaguna.com'].includes(userRole);

  return (
    <aside className={`${isCollapsed ? 'w-11' : 'w-64'} bg-[#1f2937] p-5 transition-all duration-300 min-h-screen relative`}>
      <div className="absolute top-10 left-2">
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none text-3xl"
        >
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
          {canViewAsesores && (
            <li className="mb-4">
              <Link href="/user" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Asesores Comerciales'}
              </Link>
            </li>
          )}
          {canViewReportesUnidadNegocio && (
            <li className="mb-4">
              <Link href="/reportes-unidad-negocio" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Reportes Unidad Negocio'}
              </Link>
            </li>
          )}

          {/* Mostrar el enlace de "Reportes Mensuales" según los roles permitidos */}
          {canViewReportesMensuales && (
            <li className="mb-4">
              <Link href="/reporte-mensual" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Reportes Mensuales'}
              </Link>
            </li>
          )}

          {/* Mostrar el enlace de "Calendario" según los roles permitidos */}
          {canViewCalendario && (
            <li className="mb-4">
              <Link href="/calendario" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Calendario'}
              </Link>
            </li>
          )}

          {/* Mostrar el enlace de "Clientes" según los roles permitidos */}
          {canViewClientes && (
            <li className="mb-4">
              <Link href="/clientes" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Clientes'}
              </Link>
            </li>
          )}

          {/* Mostrar el enlace de "Cotizaciones" según el rol y email específicos */}
          {canViewCotizaciones && (
            <li className="mb-4">
              <Link href="/cotizacion" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Cotizaciones'}
              </Link>
            </li>
          )}

          {/* Mostrar el enlace de "Servicios" según los roles permitidos */}
          {canViewServicios && (
            <li className="mb-4">
              <Link href="/servicios" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Servicios'}
              </Link>
            </li>
          )}

          {/* Mostrar el enlace de "Creditos" según los roles permitidos */}
          {canViewCreditos && (
            <li className="mb-4">
              <Link href="creditos" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Creditos'}
              </Link>
            </li>
          )}

          {/* Mostrar el enlace de "Incidencias" según los roles permitidos */}
          {canViewIncidencias && (
            <li className="mb-4">
              <Link href="#" className="flex items-center p-2 rounded hover:bg-[#374151]">
                {!isCollapsed && 'Incidencias'}
              </Link>
            </li>
          )}

          {/* Mostrar el enlace de "Chat" según los roles permitidos */}
          {canViewChat && (
            <li className="mb-4">
              <Link href="chat" className="flex items-center p-2 rounded hover:bg-[#374151]">
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