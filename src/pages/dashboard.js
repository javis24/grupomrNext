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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Estado inicial colapsado

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.decode(token);
        setUserData(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const appointments = response.data;

        const now = new Date();
        const upcoming = appointments
          .filter(appointment => new Date(appointment.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        setUpcomingAppointment(upcoming);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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
          {/* Total Users */}
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl sm:text-lg font-semibold">Total Users</h2>
            <p className="text-2xl sm:text-xl font-bold mt-2">10,928</p>
            <p className="text-green-400 mt-1 text-sm sm:text-base">12% more than previous week</p>
          </div>

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

          {/* Revenue */}
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl sm:text-lg font-semibold">Revenue</h2>
            <p className="text-2xl sm:text-xl font-bold mt-2">$6,642</p>
            <p className="text-green-400 mt-1 text-sm sm:text-base">18% more than previous week</p>
          </div>

          {/* Welcome Message */}
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg w-full">
            <h2 className="text-xl sm:text-lg font-semibold">Welcome, {userData.role || 'User'}</h2>
            <p className="text-lg sm:text-base">Hello {userData.name || 'there'}! Welcome to your dashboard.</p>
          </div>
        </section>

        {/* Latest Transactions */}
        <section className="bg-[#1f2937] p-4 rounded-lg shadow-lg w-full">
          <h2 className="text-xl sm:text-lg font-semibold mb-4">Client List</h2>
          <div className="overflow-x-auto">
            <ClientList />
          </div>
        </section>
      </main>
    </div>
  );
}

export default withAuth(Dashboard);
