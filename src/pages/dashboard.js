import '../app/globals.css';
import Sidebar from '@/components/Sidebar';
import jwt from 'jsonwebtoken';
import { useEffect, useState } from 'react';
import withAuth from '@/utils/withAuth';
import axios from 'axios';
import ClientList from '@/components/ClientList';

function Dashboard() {
  const [userData, setUserData] = useState({});
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [latestClients, setLatestClients] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwt.decode(token);
          setUserData(decoded);
    
          // Actualiza el campo lastActive cuando se carga el dashboard
          axios.get('/api/lastActive', {
            headers: { Authorization: `Bearer ${token}` },
          }).then(() => {
            console.log('Last active actualizado');
          }).catch(error => {
            console.error('Error actualizando lastActive:', error);
          });
    
          // Solo permitir que admin y gerencia accedan a usuarios activos
          if (decoded.role === 'admin' || decoded.role === 'gerencia') {
            axios.get('/api/users?active=true', { headers: { Authorization: `Bearer ${token}` } })
              .then((response) => {
                setActiveUsers(response.data);
                console.log("Usuarios activos recibidos:", response.data);
              })
              .catch(error => {
                console.error('Error fetching active users:', error);
                setError('Error fetching active users.');
              });
          }
    
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [appointmentsRes, clientsRes, usersRes] = await Promise.all([
          axios.get('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/clients?latest=true', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users?active=true', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const now = new Date();
        const upcoming = appointmentsRes.data
          .filter(appointment => new Date(appointment.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        setUpcomingAppointment(upcoming);
        setLatestClients(clientsRes.data);
        setActiveUsers(usersRes.data);

        console.log("Usuarios activos recibidos:", usersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return <p className="text-center text-white">Cargando...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-[#1f2937] p-5 transition-all duration-300`}>
        <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <main className={`flex-grow p-4 sm:p-2 bg-[#0e1624] transition-all duration-300 ${isSidebarCollapsed ? 'ml-8' : 'ml-64'}`}>
        <header className="mb-8">
          <h1 className="text-3xl sm:text-2xl font-bold">Dashboard</h1>
        </header>

        {/* Layout responsivo */}
        <section className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
          
         {/* Muestra Usuarios Activos solo si el rol es admin o gerencia */}
        {userData.role === 'admin' || userData.role === 'gerencia' ? (
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">Usuarios Activos</h2>
            {activeUsers.length > 0 ? (
              <ul>
                {activeUsers.map((user, index) => (
                  <li key={index} className="mt-2">
                    <p>{user.name} ({user.email}) - Activo: {new Date(user.lastActive).toLocaleTimeString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-400">No hay usuarios activos actualmente.</p>
            )}
          </div>
        ) : null}

          {/* Próxima Cita */}
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl sm:text-lg font-semibold">Próxima Cita</h2>
            {upcomingAppointment ? (
              <>
                <p className="text-2xl sm:text-xl font-bold mt-2">{upcomingAppointment.clientName}</p>
                <p className="mt-1 text-sm sm:text-base">
                  Fecha: {new Date(upcomingAppointment.date).toLocaleDateString()}
                </p>
                <p className="text-green-400 mt-1 text-sm sm:text-base">Estado: {upcomingAppointment.clientStatus}</p>
              </>
            ) : (
              <p className="text-red-400 mt-2 text-sm sm:text-base">No hay citas próximas.</p>
            )}
          </div>

          {/* Últimos 5 Clientes */}
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl sm:text-lg font-semibold">Últimos 5 Clientes</h2>
            {latestClients.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {latestClients.map((client, index) => (
                  <li key={index} className="text-sm sm:text-base">
                    <strong>Nombre: {client.fullName}</strong> <br /><strong>Email: {client.email}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-400 mt-2 text-sm sm:text-base">No se encontraron clientes recientes.</p>
            )}
          </div>
        </section>

        {/* Welcome Message */}
        <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg w-full">
          <h2 className="text-xl sm:text-lg font-semibold">Welcome, {userData.role || 'User'}</h2>
          <p className="text-lg sm:text-base">Hello {userData.name || 'there'}! Welcome to your dashboard.</p>
        </div>

        <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg w-full">
          <ClientList />
        </div>
      </main>
    </div>
  );
}

export default withAuth(Dashboard);
