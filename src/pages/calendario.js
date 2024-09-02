// src/pages/calendar.js
import Sidebar from '@/components/Sidebar';
import CalendarCard from '@/components/CalendarCard';
import '../app/globals.css';


export default function Calendario() {
  return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <CalendarCard />
      </main>
    </div>
  );
}
