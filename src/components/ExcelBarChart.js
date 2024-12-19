import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Papa from 'papaparse';
import Select from 'react-select';

// Registra los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ExcelBarChart() {
    const [chartData, setChartData] = useState(null);
    const [fileName, setFileName] = useState("");
    const [tableData, setTableData] = useState([]);
    const [filteredYear, setFilteredYear] = useState("2023");

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const jsonData = results.data;
                setTableData(jsonData);

                // Procesar los datos del archivo
                const labels = jsonData.map((row) => row['Mes'] || 'Sin Mes');
                const values = jsonData.map((row) => parseFloat(row['Venta']) || 0);

                // Configurar los datos para la gráfica
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Venta',
                            data: values,
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                        },
                    ],
                });
            },
        });
    };

    const handleYearFilterChange = (selectedOption) => {
        setFilteredYear(selectedOption.value);
    };

    // Opciones de filtro de años
    const yearOptions = [
        { value: '2023', label: '2023' },
        { value: '2024', label: '2024' },
    ];

    // Filtrar los datos de la tabla
    const filteredData = tableData.filter(
        (row) => row['Año'] === filteredYear
    );

    const calculateTotal = (column) => {
        return filteredData.reduce((total, row) => total + parseFloat(row[column] || 0), 0).toFixed(2);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <h1 className="text-2xl font-bold mb-4">Gráfica y Tabla Dinámica con Filtros</h1>

            {/* Cargar archivo CSV */}
            <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mb-4 border border-gray-300 p-2 rounded bg-white"
            />

            {fileName && <p className="mb-4 text-gray-600">Archivo cargado: {fileName}</p>}

            {/* Filtro por año */}
            <div className="mb-4 w-full max-w-md">
                <Select
                    options={yearOptions}
                    defaultValue={yearOptions[0]}
                    onChange={handleYearFilterChange}
                    className="text-black"
                />
            </div>

            {/* Mostrar gráfica si hay datos */}
            {chartData ? (
                <div className="w-full max-w-4xl bg-white p-4 rounded shadow mb-8">
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Datos Importados desde CSV',
                                },
                            },
                        }}
                    />
                </div>
            ) : (
                <p className="text-gray-500">Sube un archivo CSV para generar la gráfica.</p>
            )}

            {/* Mostrar tabla dinámica */}
            {filteredData.length > 0 && (
                <div className="w-full max-w-4xl bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Ventas por Año</h2>
                    <table className="table-auto w-full border-collapse border border-gray-300 text-center">
                        <thead>
                            <tr className="bg-pink-200">
                                <th className="border border-gray-300 px-4 py-2">MES</th>
                                <th className="border border-gray-300 px-4 py-2">2023</th>
                                <th className="border border-gray-300 px-4 py-2">2024</th>
                                <th className="border border-gray-300 px-4 py-2">PROYECCIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-100">
                                    <td className="border border-gray-300 px-4 py-2">{row['Mes']}</td>
                                    <td className="border border-gray-300 px-4 py-2">{row['Año'] === '2023' ? row['Venta'] : ''}</td>
                                    <td className="border border-gray-300 px-4 py-2">{row['Año'] === '2024' ? row['Venta'] : ''}</td>
                                    <td className="border border-gray-300 px-4 py-2">{(parseFloat(row['Venta']) * 1.1).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-pink-300 font-bold">
                                <td className="border border-gray-300 px-4 py-2">Total general</td>
                                <td className="border border-gray-300 px-4 py-2">{calculateTotal('Venta')}</td>
                                <td className="border border-gray-300 px-4 py-2">{calculateTotal('Venta')}</td>
                                <td className="border border-gray-300 px-4 py-2">{(calculateTotal('Venta') * 1.1).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div className="mt-4 bg-pink-200 p-4 rounded text-center font-bold">
                        OBJETIVO NOVIEMBRE 2024: ${calculateTotal('Venta')}
                    </div>
                </div>
            )}
        </div>
    );
}
