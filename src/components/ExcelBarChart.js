import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
  
  // Aquí agregamos los nuevos campos: "VentaAnterior" y "Unidad"
  const [newRow, setNewRow] = useState({
    Año: "",
    Mes: "",
    Venta: "",
    VentaAnterior: "",
    Unidad: ""
  });
  const [editRow, setEditRow] = useState(null); // Para manejar la edición
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);

  // Estado para el porcentaje de proyección que el usuario escoge
  const [projectionPercentage, setProjectionPercentage] = useState(15);

  // Lista de meses (para el filtro)
  const meses = useMemo(
    () => [
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
    ],
    []
  );

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

  



  // Maneja el cambio en los inputs (incluyendo los nuevos campos)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editRow) {
      setEditRow((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewRow((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Agregar una nueva fila (POST) con los campos adicionales
  const addRow = async () => {
    const { Año, Mes, Venta, VentaAnterior, Unidad } = newRow;
    if (!Año || !Mes || !Venta || !VentaAnterior || !Unidad) {
      alert("Por favor, completa todos los campos antes de agregar.");
      return;
    }

    const newData = {
      year: parseInt(Año, 10),
      month: Mes.toUpperCase(),
      sale: parseFloat(Venta),           // Venta actual
      previousSale: parseFloat(VentaAnterior), // Venta año anterior
      unitName: Unidad                   // Unidad o nombre de la unidad
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
      // Agregamos el registro nuevo al estado
      setTableData((prev) => [...prev, savedData]);
      setFilteredData((prev) => [...prev, savedData]);

      // Reseteamos el formulario
      setNewRow({
        Año: "",
        Mes: "",
        Venta: "",
        VentaAnterior: "",
        Unidad: ""
      });
    } catch (error) {
      console.error("Error al guardar el dato:", error);
    }
  };

  // Eliminar fila (DELETE)
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

  // Editar fila (PUT) con los campos adicionales
  const editRowData = async () => {
    if (!editRow.id) {
      alert("No se encontró el ID del registro a editar.");
      return;
    }

    const { Año, Mes, Venta, VentaAnterior, Unidad, id } = editRow;
    if (!Año || !Mes || !Venta || !VentaAnterior || !Unidad) {
      alert("Completa todos los campos antes de guardar.");
      return;
    }

    const updatedData = {
      id,
      year: parseInt(Año, 10),
      month: Mes.toUpperCase(),
      sale: parseFloat(Venta),
      previousSale: parseFloat(VentaAnterior),
      unitName: Unidad
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

  // Filtro de meses

  const unidadesUnicas = useMemo(() => {
    const todas = tableData.map((row) => row.unitName);
    return [...new Set(todas.filter(Boolean))]; // Quitar duplicados y vacíos
  }, [tableData]);

  const aplicarFiltros = () => {
    let datosFiltrados = tableData;
  
    if (mesesSeleccionados.length > 0) {
      datosFiltrados = datosFiltrados.filter((row) => {
        const mes = (row.month || "").toUpperCase().trim();
        return mesesSeleccionados.includes(mes);
      });
    }
  
    if (unidadSeleccionada !== "") {
      datosFiltrados = datosFiltrados.filter(
        (row) => (row.unitName || "").trim().toUpperCase() === unidadSeleccionada.trim().toUpperCase()
      );
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

  // Cálculo de la proyección basado en la venta del año anterior
  const calcularProyeccion = useCallback(
    (ventaAnterior) => {
      return ventaAnterior + ventaAnterior * (projectionPercentage / 100);
    },
    [projectionPercentage]
  );

  // Creamos un arreglo que incluye la venta anterior y su proyección
  const datosConProyeccion = useMemo(() => {
    return filteredData.map((row) => ({
      ...row,
      proyeccion: calcularProyeccion(row.previousSale || 0),
    }));
  }, [filteredData, calcularProyeccion]);

  // Datos para la gráfica: comparamos Venta del Año Anterior vs Proyección
        const chartData = useMemo(() => {
        const labels = datosConProyeccion.map((row) => `${row.month} (${row.unitName || 'Sin Unidad'})`);
        const ventasActuales = datosConProyeccion.map((row) => row.sale || 0);
        const ventasAnioAnterior = datosConProyeccion.map((row) => row.previousSale || 0);
      
        return {
          labels,
          datasets: [
            {
              label: "Año Anterior",
              data: ventasAnioAnterior,
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "Venta Actual",
              data: ventasActuales,
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
        text: "Proyección de Ventas Basada en Año Anterior",
      },
    },
  };

  // Definimos las columnas (ahora con Unidad y Venta Año Anterior)
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
        Header: "Unidad",
        accessor: "unitName", // donde guardamos la unidad
      },
      {
        Header: "Venta Actual",
        accessor: "sale",
        Cell: ({ value }) => `$ ${value ? value.toFixed(2) : "0.00"}`,
      },
      {
        Header: "Venta Año Anterior",
        accessor: "previousSale",
        Cell: ({ value }) => `$ ${value ? value.toFixed(2) : "0.00"}`,
      },
      {
        Header: `Proyección (${projectionPercentage}%)`,
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
                  VentaAnterior: row.original.previousSale,
                  Unidad: row.original.unitName,
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
    [projectionPercentage, deleteRow]
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
      <div className="mb-4 flex gap-2 text-black flex-wrap">
        <input
          type="number"
          name="Año"
          value={editRow ? editRow.Año : newRow.Año}
          onChange={handleInputChange}
          placeholder="Año"
          className="border border-gray-300 p-1 text-sm rounded w-16"
        />
        <input
          type="text"
          name="Mes"
          value={editRow ? editRow.Mes : newRow.Mes}
          onChange={handleInputChange}
          placeholder="Mes (ENE, FEB, etc.)"
          className="border border-gray-300 p-1 text-sm rounded w-20"
        />
        <input
          type="number"
          step="0.01"
          name="Venta"
          value={editRow ? editRow.Venta : newRow.Venta}
          onChange={handleInputChange}
          placeholder="Venta Actual"
          className="border border-gray-300 p-1 text-sm rounded w-24"
        />
        <input
          type="number"
          step="0.01"
          name="VentaAnterior"
          value={editRow ? editRow.VentaAnterior : newRow.VentaAnterior}
          onChange={handleInputChange}
          placeholder="Venta Año Ant."
          className="border border-gray-300 p-1 text-sm rounded w-24"
        />
        <input
          type="text"
          name="Unidad"
          value={editRow ? editRow.Unidad : newRow.Unidad}
          onChange={handleInputChange}
          placeholder="Unidad"
          className="border border-gray-300 p-1 text-sm rounded w-24"
        />
        {editRow ? (
          <>
            <button className="bg-green-500 text-white px-3 py-1" onClick={editRowData}>
              Guardar
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1"
              onClick={() => setEditRow(null)}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button className="bg-blue-500 text-white px-3 py-1" onClick={addRow}>
            Agregar
          </button>
        )}
      </div>

      {/* Select para cambiar el porcentaje de proyección */}
      <div className="mb-4 text-black">
        <label className="mr-2 font-bold">Proyección:</label>
        <select
          value={projectionPercentage}
          onChange={(e) => setProjectionPercentage(Number(e.target.value))}
          className="border border-gray-300 p-1 text-sm rounded"
        >
          <option value={5}>5%</option>
          <option value={10}>10%</option>
          <option value={15}>15%</option>
          <option value={20}>20%</option>
          <option value={25}>25%</option>
        </select>
      </div>

      {/* Filtros por selección múltiple (Meses) */}
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
        <label className="text-white mr-2">Planta / Unidad:</label>
          <select
            className="border border-gray-300 p-1 text-sm rounded text-black"
            value={unidadSeleccionada}
            onChange={(e) => setUnidadSeleccionada(e.target.value)}
          >
            <option value="">Todas</option>
            {unidadesUnicas.map((unidad, index) => (
              <option key={index} value={unidad}>
                {unidad}
              </option>
            ))}
          </select>
          <button
          onClick={aplicarFiltros}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Filtrar
        </button>
          <button
            onClick={() => {
              setMesesSeleccionados([]);
              setFilteredData(tableData); // Volvemos a mostrar todos
            }}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Limpiar Selección
          </button>
        </div>
      </div>

      {(unidadSeleccionada || mesesSeleccionados.length > 0) && (
          <div className="text-white mb-4 text-sm">
            <span className="mr-4">
              <strong>Filtros activos:</strong>
            </span>
            {unidadSeleccionada && (
              <span className="mr-4">Unidad: <b>{unidadSeleccionada}</b></span>
            )}
            {mesesSeleccionados.length > 0 && (
              <span>
                Meses: <b>{mesesSeleccionados.join(", ")}</b>
              </span>
            )}
          </div>
        )}
      {/* Gráfica */}
      <div className="mb-8 w-full max-w-4xl">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Tabla con los datos */}
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
