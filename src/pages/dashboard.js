// src/app/dashboard/page.js
import '../app/globals.css';
import Sidebar from '@/components/Sidebar';
//import CalendarWithEvents from '@/components/CalendarWithEvents';
export default function Dashboard() {
    return (
    <div className="flex min-h-screen bg-[#0e1624] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </header>
        <section className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">Total Users</h2>
            <p className="text-2xl font-bold mt-2">10,928</p>
            <p className="text-green-400 mt-1">12% more than previous week</p>
          </div>
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">Stock</h2>
            <p className="text-2xl font-bold mt-2">8,236</p>
            <p className="text-red-400 mt-1">2% less than previous week</p>
          </div>
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">Revenue</h2>
            <p className="text-2xl font-bold mt-2">$6,642</p>
            <p className="text-green-400 mt-1">18% more than previous week</p>
          </div>
          <div className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
        
          </div>
        </section>
        <section className="bg-[#1f2937] p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Latest Transactions</h2>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="pb-4">Name</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">Josephine Zimmerman</td>
                <td className="py-2"><span className="bg-yellow-400 text-black px-2 py-1 rounded">pending</span></td>
                <td className="py-2">14.01.2024</td>
                <td className="py-2">$3,200</td>
              </tr>
              <tr>
                <td className="py-2">Cecilia Harriet</td>
                <td className="py-2"><span className="bg-green-400 text-black px-2 py-1 rounded">done</span></td>
                <td className="py-2">13.01.2024</td>
                <td className="py-2">$2,800</td>
              </tr>
              <tr>
                <td className="py-2">Dennis Thomas</td>
                <td className="py-2"><span className="bg-red-400 text-black px-2 py-1 rounded">cancelled</span></td>
                <td className="py-2">12.01.2024</td>
                <td className="py-2">$2,600</td>
              </tr>
              <tr>
                <td className="py-2">Lula Neal</td>
                <td className="py-2"><span className="bg-yellow-400 text-black px-2 py-1 rounded">pending</span></td>
                <td className="py-2">11.01.2024</td>
                <td className="py-2">$3,200</td>
              </tr>
              <tr>
                <td className="py-2">Jeff Montgomery</td>
                <td className="py-2"><span className="bg-green-400 text-black px-2 py-1 rounded">done</span></td>
                <td className="py-2">10.01.2024</td>
                <td className="py-2">$4,600</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">        
        </section>
      </main>
    </div>
  );
}
