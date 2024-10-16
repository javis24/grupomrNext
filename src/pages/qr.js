import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data);
      updateQRCodeStatus(data); // Llama a la función para actualizar el estado del QR
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Error escaneando el código QR');
  };

  // Función para actualizar el estado del código QR
  const updateQRCodeStatus = async (qrData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.post(
        '/api/qrcode/visit', // Ruta de la API para marcar el QR como visitado
        { qrCode: qrData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert('Código QR actualizado como visitado');
      } else {
        alert('Error actualizando el estado del código QR');
      }
    } catch (err) {
      console.error(err);
      alert('Hubo un problema al actualizar el código QR');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Escanea un código QR</h2>

      {/* Componente del lector de QR */}
      <QrReader
        delay={300}
        onResult={(result, error) => {
          if (result) {
            handleScan(result?.text); // Escanea y obtiene el texto del QR
          }
          if (error) {
            handleError(error); // Maneja errores si ocurren
          }
        }}
        style={{ width: '100%' }}
      />

      {/* Resultado del escaneo */}
      {scanResult && (
        <div className="mt-4">
          <p>Código QR escaneado:</p>
          <p className="font-bold">{scanResult}</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default QRScanner;
