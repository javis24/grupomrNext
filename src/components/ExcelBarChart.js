import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Papa from 'papaparse';
import { useTable } from 'react-table';

// Registra los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ExcelBarChart() {
    const [chartData, setChartData] = useState(null);
    const [fileName, setFileName] = useState("");
    const [tableData, setTableData] = useState([]);

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

    const columns = React.useMemo(
        () => [
            { Header: 'Año', accessor: 'Año' },
            { Header: 'Mes', accessor: 'Mes' },
            { Header: 'Venta', accessor: 'Venta' },
        ],
        []
    );

    const data = React.useMemo(() => tableData, [tableData]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <h1 className="text-2xl font-bold mb-4">Gráfica de Barras y Tabla Dinámica desde CSV</h1>

            {/* Cargar archivo CSV */}
            <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mb-4 border border-gray-300 p-2 rounded bg-white"
            />

            {fileName && <p className="mb-4 text-gray-600">Archivo cargado: {fileName}</p>}

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
            {tableData.length > 0 && (
                <div className="w-full max-w-4xl p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Tabla Dinámica</h2>
                    <table {...getTableProps()} className="table-auto w-full border-collapse border border-gray-300">
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map((column) => (
                                        <th
                                            {...column.getHeaderProps()}
                                            className="border border-gray-300 px-4 py-2 text-left"
                                        >
                                            {column.render('Header')}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map((row) => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()} className="">
                                        {row.cells.map((cell) => (
                                            <td
                                                {...cell.getCellProps()}
                                                className="border border-gray-300 px-4 py-2"
                                            >
                                                {cell.render('Cell')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
