import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRCodeReader = () => {
  const [qrData, setQrData] = useState('No QR code scanned');
  const [cameraId, setCameraId] = useState(null);

  useEffect(() => {
    // Obtener cámaras disponibles y seleccionar la cámara trasera
    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        // Buscar una cámara trasera (con "back" o "rear")
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')
        );
        const selectedCameraId = backCamera ? backCamera.id : devices[0].id;
        setCameraId(selectedCameraId);
      }
    }).catch(err => {
      console.error('Error getting cameras: ', err);
    });
  }, []);

  useEffect(() => {
    if (cameraId) {
      const html5QrCode = new Html5Qrcode("reader");

      // Función para validar si es una URL
      const isValidURL = (string) => {
        try {
          new URL(string);
          return true;
        } catch (_) {
          return false;
        }
      };

      // Configuración adicional para asegurar la cámara trasera
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        facingMode: { exact: "environment" } // Aquí forzamos la cámara trasera
      };

      // Iniciar escaneo con la cámara seleccionada
      html5QrCode.start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          setQrData(decodedText); // Mostrar los datos escaneados

          // Redirigir a la URL si es válida
          if (isValidURL(decodedText)) {
            window.location.href = decodedText;
          }
        },
        (error) => {
          console.warn(`Error scanning: ${error}`);
        }
      ).catch(err => {
        console.error('Error starting QR scanner: ', err);
      });

      return () => {
        html5QrCode.stop().then(() => {
          console.log('QR scanning stopped.');
        }).catch(err => {
          console.error('Failed to stop QR scanning.', err);
        });
      };
    }
  }, [cameraId]);

  return (
    <div>
      <h1>QR Code Scanner</h1>
      <div id="reader" style={{ width: '300px' }}></div>
      <p>Scanned QR Code Data: {qrData}</p>
    </div>
  );
};

export default QRCodeReader;
