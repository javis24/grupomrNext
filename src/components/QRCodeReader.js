import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRCodeReader = () => {
  const [qrData, setQrData] = useState('No QR code scanned');
  const qrCodeRef = useRef(null);

  useEffect(() => {
    const html5QrCodeScanner = new Html5QrcodeScanner(
      'reader', 
      {
        fps: 10,    // Frames per second
        qrbox: { width: 250, height: 250 }, // Define el área de escaneo
      },
      /* verbose= */ false
    );

    // Configura lo que ocurre al escanear o encontrar un error
    html5QrCodeScanner.render(
      (decodedText, decodedResult) => {
        setQrData(decodedText); // Setea los datos cuando encuentra un código
      },
      (error) => {
        console.log(`Error scanning: ${error}`);
      }
    );

    // Limpiar el escáner al desmontar el componente
    return () => {
      html5QrCodeScanner.clear().catch((error) => {
        console.error('Failed to clear QR Code scanner.', error);
      });
    };
  }, []);

  return (
    <div>
      <h1>QR Code Scanner</h1>
      <div id="reader" style={{ width: '300px' }} ref={qrCodeRef}></div>
      <p>Scanned QR Code Data: {qrData}</p>
    </div>
  );
};

export default QRCodeReader;
