import React, { useState, useEffect, useMemo } from "react";
import { useTable } from "react-table";

export function ExcelBarChart() {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [newRow, setNewRow] = useState({ Año: "", Mes: "", Venta: "" });
  const [mesInicio, setMesInicio] = useState("");
  const [mesFin, setMesFin] = useState("");

  const meses = [
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
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/sales/salestabla");
        const data = await response.json();

        if (Array.isArray(data)) {
          setTableData(data);
          setFilteredData(data); // Inicializa los datos filtrados
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
    setNewRow({ ...newRow, [name]: value });
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
      setTableData([...tableData, savedData]);
      setFilteredData([...tableData, savedData]);
      setNewRow({ Año: "", Mes: "", Venta: "" });
    } catch (error) {
      console.error("Error al guardar el dato:", error);
    }
  };

  const aplicarFiltros = () => {
    if (!mesInicio || !mesFin) {
      alert("Por favor, selecciona ambos meses para aplicar el filtro.");
      return;
    }
  
    const indexInicio = meses.findIndex((m) => m.value === mesInicio);
    const indexFin = meses.findIndex((m) => m.value === mesFin);
  
    if (indexInicio === -1 || indexFin === -1 || indexInicio > indexFin) {
      alert("Selecciona un rango válido de meses (el mes final debe ser posterior al inicial).");
      return;
    }
  
    const datosFiltrados = tableData.filter((row) => {
      const indexMes = meses.findIndex((m) => m.value === row.month.toUpperCase());
      return indexMes >= indexInicio && indexMes <= indexFin;
    });
    
  
    if (datosFiltrados.length === 0) {
      alert("No hay datos que coincidan con el rango de meses seleccionado.");
    }
  
    setFilteredData(datosFiltrados);
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
    ],
    []
  );

  const tableInstance = useTable({
    columns,
    data: filteredData,
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
          value={newRow.Año}
          onChange={handleInputChange}
          placeholder="Año"
          className="border border-gray-300 p-1 text-sm rounded w-20"
        />
        <input
          type="text"
          name="Mes"
          value={newRow.Mes}
          onChange={handleInputChange}
          placeholder="Mes (ENE, FEB, etc.)"
          className="border border-gray-300 p-1 text-sm rounded w-24"
        />
        <input
          type="number"
          step="0.01"
          name="Venta"
          value={newRow.Venta}
          onChange={handleInputChange}
          placeholder="Venta"
          className="border border-gray-300 p-1 text-sm rounded w-28"
        />
        <button
          onClick={addRow}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Agregar
        </button>
      </div>

      {/* Filtros por rango de meses */}
      <div className="mb-4 flex gap-2 text-black">
      <select
          value={mesInicio}
          onChange={(e) => setMesInicio(e.target.value)}
          className="border border-gray-300 p-1 text-sm rounded"
        >
          <option value="">Mes Inicio</option>
          {meses.map((mes) => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>

        <select
          value={mesFin}
          onChange={(e) => setMesFin(e.target.value)}
          className="border border-gray-300 p-1 text-sm rounded"
        >
          <option value="">Mes Fin</option>
          {meses.map((mes) => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>

        <button
          onClick={aplicarFiltros}
          disabled={!mesInicio || !mesFin}
          className={`px-3 py-1 rounded text-sm ${
            !mesInicio || !mesFin ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-green-500 text-white"
          }`}
        >
          Filtrar
        </button>
      </div>

      {/* Tabla con los datos filtrados */}
      <div className="mb-4 w-full max-w-4xl">
        <table
          {...getTableProps()}
          className="table-auto w-full border border-collapse"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
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
                rows.map((row, rowIndex) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} key={rowIndex}>
                      {row.cells.map((cell, cellIndex) => (
                        <td {...cell.getCellProps()} key={cellIndex} className="border px-4 py-2 text-left">
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
