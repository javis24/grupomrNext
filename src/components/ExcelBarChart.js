import React, { useState, useEffect, useMemo, useCallback } from "react"; // Asegúrate de importar useCallback
import { useTable } from "react-table";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ExcelBarChart() {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [newRow, setNewRow] = useState({ Año: "", Mes: "", Venta: "" });
  const [editRow, setEditRow] = useState(null); // Para manejar la edición
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);

  const meses = useMemo(() => [
    { value: "ENERO", label: "Enero" },
    { value: "FEBRERO", label: "Febrero" },
    { value: "MARZO", label: "Marzo" },
    { value: "ABRIL", label: "Abril" },
    { value: "MAYO", label: "Mayo" },
    { value: "JUNIO", label: "Junio" },
    { value: "JULIO", label: "Julio" },
    { value: "AGOSTO", label: "Agosto" },
    { value: "SEPTIEMBRE", label: "Septiembre" },
    { value: "OCTUBRE", label: "Octubre" },
    { value: "NOVIEMBRE", label: "Noviembre" },
    { value: "DICIEMBRE", label: "Diciembre" },
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/sales/salestabla");
        const data = await response.json();

        if (Array.isArray(data)) {
          setTableData(data);
          setFilteredData(data);
        } else {
          console.error("La API no devolvió un array válido.");
          setTableData([]);
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setTableData([]);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editRow) {
      setEditRow((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewRow((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addRow = async () => {
    if (!newRow.Año || !newRow.Mes || !newRow.Venta) {
      alert("Por favor, completa todos los campos antes de agregar.");
      return;
    }

    const newData = {
      year: parseInt(newRow.Año, 10),
      month: newRow.Mes.toUpperCase(),
      sale: parseFloat(newRow.Venta),
    };

    try {
      const response = await fetch("/api/sales/salestabla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los datos");
      }

      const savedData = await response.json();
      setTableData((prev) => [...prev, savedData]);
      setFilteredData((prev) => [...prev, savedData]);
      setNewRow({ Año: "", Mes: "", Venta: "" });
    } catch (error) {
      console.error("Error al guardar el dato:", error);
    }
  };

  const deleteRow = useCallback(async (id) => {
    try {
      const response = await fetch("/api/sales/salestabla", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el registro");
      }

      setTableData((prev) => prev.filter((item) => item.id !== id));
      setFilteredData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
    }
  }, []);

  const editRowData = async () => {
    if (!editRow.id || !editRow.Año || !editRow.Mes || !editRow.Venta) {
      alert("Completa todos los campos antes de guardar.");
      return;
    }
  
    const updatedData = {
      id: editRow.id,
      year: parseInt(editRow.Año, 10),
      month: editRow.Mes.toUpperCase(),
      sale: parseFloat(editRow.Venta),
    };
  
    try {
      const response = await fetch("/api/sales/salestabla", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        throw new Error("Error al actualizar el registro");
      }
  
      const updatedRecord = await response.json();
  
      // Actualiza los datos en el estado
      setTableData((prev) =>
        prev.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
      );
      setFilteredData((prev) =>
        prev.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
      );
  
      // Resetea la fila en edición
      setEditRow(null);
    } catch (error) {
      console.error("Error al actualizar el registro:", error);
    }
  };
  

  const aplicarFiltros = () => {
    if (mesesSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos un mes.");
      return;
    }

    const datosFiltrados = tableData.filter((row) =>
      mesesSeleccionados.includes(row.month.toUpperCase())
    );

    if (datosFiltrados.length === 0) {
      alert("No hay datos que coincidan con los meses seleccionados.");
    }

    setFilteredData(datosFiltrados);
  };

  const handleMesesSeleccionados = (e) => {
    const seleccionados = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setMesesSeleccionados(seleccionados);
  };

  const calcularProyeccion = (valor) => {
    return valor * 0.15 + valor; // 15% adicional
  };

  const datosConProyeccion = filteredData.map((row) => ({
    ...row,
    proyeccion: calcularProyeccion(row.sale),
  }));

  // Datos para la gráfica
  const chartData = useMemo(() => {
    const labels = datosConProyeccion.map((row) => row.month);
    const ventas2023 = datosConProyeccion.map((row) => row.sale);
    const proyecciones = datosConProyeccion.map((row) =>
      calcularProyeccion(row.sale)
    );

    return {
      labels,
      datasets: [
        {
          label: "2023",
          data: ventas2023,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          label: "Proyección",
          data: proyecciones,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
      ],
    };
  }, [datosConProyeccion]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Proyección de Ventas por Mes",
      },
    },
  };

  const columns = useMemo(
    () => [
      {
        Header: "Mes",
        accessor: "month",
      },
      {
        Header: "Año",
        accessor: "year",
      },
      {
        Header: "Venta",
        accessor: "sale",
        Cell: ({ value }) => `$ ${value ? value.toFixed(2) : "0.00"}`,
      },
      {
        Header: "Proyección (15%)",
        accessor: "proyeccion",
        Cell: ({ value }) => `$ ${value ? value.toFixed(2) : "0.00"}`,
      },
      {
        Header: "Acciones",
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              className="bg-yellow-500 px-2 py-1 rounded text-white"
              onClick={() =>
                setEditRow({
                  id: row.original.id,
                  Año: row.original.year,
                  Mes: row.original.month,
                  Venta: row.original.sale,
                })
              }
            >
              Editar
            </button>
            <button
              className="bg-red-500 px-2 py-1 rounded text-white"
              onClick={() => deleteRow(row.original.id)}
            >
              Eliminar
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const tableInstance = useTable({
    columns,
    data: datosConProyeccion,
  });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <h1 className="text-2xl font-bold mb-4">Tabla de Ventas con Filtros</h1>

      {/* Formulario para agregar filas */}
      <div className="mb-4 flex gap-2 text-black">
        <input
          type="number"
          name="Año"
          value={editRow ? editRow.Año : newRow.Año}
          onChange={handleInputChange}
          placeholder="Año"
          className="border border-gray-300 p-1 text-sm rounded w-20"
        />
        <input
          type="text"
          name="Mes"
          value={editRow ? editRow.Mes : newRow.Mes}
          onChange={handleInputChange}
          placeholder="Mes (ENERO, FEBRERO, etc.)"
          className="border border-gray-300 p-1 text-sm rounded w-24"
        />
        <input
          type="number"
          step="0.01"
          name="Venta"
          value={editRow ? editRow.Venta : newRow.Venta}
          onChange={handleInputChange}
          placeholder="Venta"
          className="border border-gray-300 p-1 text-sm rounded w-28"
        />
        {editRow ? (
          <button
            className="bg-green-500 text-white px-3 py-1"
            onClick={editRowData}
          >
            Guardar
          </button>
        ) : (
          <button
            className="bg-blue-500 text-white px-3 py-1"
            onClick={addRow}
          >
            Agregar
          </button>
        )}
        {editRow && (
          <button
            className="bg-red-500 text-white px-3 py-1"
            onClick={() => setEditRow(null)}
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Filtros por selección múltiple */}
      <div className="mb-4">
        <div className="mb-2 flex flex-wrap gap-2">
          {mesesSeleccionados.map((mes) => (
            <span
              key={mes}
              className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
            >
              {meses.find((m) => m.value === mes)?.label}
            </span>
          ))}
        </div>

        <select
          multiple
          onChange={handleMesesSeleccionados}
          className="border border-gray-300 p-1 text-sm rounded w-40 text-black"
        >
          {meses.map((mes) => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>

        <div className="mt-2 flex gap-2">
          <button
            onClick={aplicarFiltros}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
          >
            Filtrar
          </button>
          <button
            onClick={() => setMesesSeleccionados([])}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Limpiar Selección
          </button>
        </div>
      </div>

      {/* Gráfica */}
      <div className="mb-8 w-full max-w-4xl">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Tabla con los datos filtrados */}
      <div className="mb-4 w-full max-w-4xl">
        <table
          {...getTableProps()}
          className="table-auto w-full border border-collapse"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    key={column.id}
                    {...column.getHeaderProps()}
                    className="border px-4 py-2 text-left"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                prepareRow(row);
                return (
                  <tr key={row.id} {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td
                        key={cell.column.id}
                        {...cell.getCellProps()}
                        className="border px-4 py-2 text-left"
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
