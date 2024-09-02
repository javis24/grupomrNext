import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { useState, useEffect } from 'react';
import ClientList from './ClientList'; // Si tienes este componente

// Registrar componentes de Chart.js
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function MonthlyReport() {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [unitSales, setUnitSales] = useState({});
  
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('/api/reports/monthly'); // Endpoint para obtener el reporte mensual
        setSalesData(response.data.sales);
        setTotalSales(response.data.totalSales);
        setUnitSales(response.data.unitSales);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchSalesData();
  }, []);

  const barData = {
    labels: Object.keys(unitSales),
    datasets: [
      {
        label: 'Total Sales',
        data: Object.values(unitSales),
        backgroundColor: ['#4CAF50', '#FF6384', '#36A2EB', '#FFCE56', '#E74C3C', '#9B59B6'],
      },
    ],
  };

  return (
    <div className="p-8 bg-[#0e1624] text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Reporte Mensual de Ventas</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Resumen General</h2>
        <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg mb-4">
          <h3 className="text-xl font-semibold">Total Ventas del Mes: ${totalSales}</h3>
        </div>
        <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg">
          <Bar data={barData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Detalle de Ventas por Vendedor</h2>
        <table className="w-full table-auto bg-[#1f2937] text-left rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2">Vendedor</th>
              <th className="px-4 py-2">Clientes Atendidos</th>
              <th className="px-4 py-2">Total Vendido</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale) => (
              <tr key={sale.vendedor} className="hover:bg-[#374151]">
                <td className="px-4 py-2">{sale.vendedor}</td>
                <td className="px-4 py-2">{sale.clientesAtendidos}</td>
                <td className="px-4 py-2">${sale.totalVendido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Ventas por Unidad de Negocio</h2>
        {Object.keys(unitSales).map((unit) => (
          <div key={unit} className="bg-[#1f2937] p-6 rounded-lg shadow-lg mb-4">
            <h3 className="text-xl font-semibold">{unit}</h3>
            <p>Total Ventas: ${unitSales[unit]}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Principales Clientes</h2>
        <ClientList />
      </div>
    </div>
  );
}
