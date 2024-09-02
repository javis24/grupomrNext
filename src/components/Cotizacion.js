// components/Cotizacion.js
//import Image from 'next/image';
import React from 'react';

const Cotizacion = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Encabezado de la cotización */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          {/* Nombre de la empresa */}
          <h1 className="text-3xl font-bold">Nombre de la Empresa</h1>
          {/* Dirección de la empresa */}
          <p className="text-gray-600">Dirección de la Empresa</p>
          <p className="text-gray-600">Teléfono de la Empresa</p>
        </div>
        {/* Logo de la empresa */}
        <div>
      
        </div>
      </div>

      {/* Información del cliente */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Información del Cliente</h2>
        <p className="text-gray-600">Nombre del Cliente</p>
        <p className="text-gray-600">Dirección del Cliente</p>
        <p className="text-gray-600">Teléfono del Cliente</p>
      </div>

      {/* Tabla de servicios/productos cotizados */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Detalles de la Cotización</h2>
        <table className="w-full mt-4 border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2">Descripción</th>
              <th className="border-b py-2">Cantidad</th>
              <th className="border-b py-2">Precio Unitario</th>
              <th className="border-b py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Ejemplo de filas */}
            <tr>
              <td className="py-2 border-b">Servicio/Producto 1</td>
              <td className="py-2 border-b text-center">1</td>
              <td className="py-2 border-b text-center">$100.00</td>
              <td className="py-2 border-b text-center">$100.00</td>
            </tr>
            <tr>
              <td className="py-2 border-b">Servicio/Producto 2</td>
              <td className="py-2 border-b text-center">2</td>
              <td className="py-2 border-b text-center">$50.00</td>
              <td className="py-2 border-b text-center">$100.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="mt-6 text-right">
        <p className="text-lg font-bold">Subtotal: $200.00</p>
        <p className="text-lg font-bold">IVA (16%): $32.00</p>
        <p className="text-lg font-bold">Total: $232.00</p>
      </div>

      {/* Notas adicionales */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Notas</h2>
        <p className="text-gray-600">Aquí puedes agregar notas adicionales sobre la cotización.</p>
      </div>
    </div>
  );
};

export default Cotizacion;
