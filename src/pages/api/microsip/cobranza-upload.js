import { authenticateToken } from '../../../lib/auth';
import MicrosipSales from '../../../models/MicrosipSalesModel';

export default async function handler(req, res) {
    // Solo permitimos el método POST para subida de datos
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Método ${req.method} no permitido` });
    }

    return new Promise((resolve) => {
        authenticateToken(req, res, async () => {
            // Verificamos autenticación
            if (!req.user) {
                res.status(401).json({ message: "Sesión expirada o inválida" });
                return resolve();
            }

            const { id: loggedUserId } = req.user;
            const { data } = req.body; // El arreglo de objetos procesados en el frontend

            if (!data || !Array.isArray(data) || data.length === 0) {
                res.status(400).json({ message: "No se recibieron datos válidos para procesar" });
                return resolve();
            }

            try {
                // Mapeamos los datos del frontend a las columnas exactas de tu modelo MicrosipSales
                const recordsToInsert = data.map(item => ({
                    fecha: item.fecha, // Viene como Date o String ISO
                    folio: String(item.folio),
                    cliente: item.cliente,
                    claveArticulo: item.claveArticulo || 'S/C', // Por si el Excel no la trae
                    articulo: item.articulo || 'Venta General',
                    unidades: parseFloat(item.unidades || 1),
                    precioUnitario: parseFloat(item.precioUnitario || 0),
                    montoNeto: parseFloat(item.saldo || item.montoNeto || 0), // Usamos el saldo pendiente como monto neto
                    vendedor: item.asesor || item.vendedor,
                    userId: loggedUserId // Guardamos quién subió el reporte
                }));

                // Inserción masiva en la base de datos
                await MicrosipSales.bulkCreate(recordsToInsert);

                res.status(200).json({ 
                    message: "Sincronización exitosa", 
                    count: recordsToInsert.length 
                });

            } catch (error) {
                console.error("Error en Bulk Upload Microsip:", error);
                res.status(500).json({ 
                    message: "Error interno al guardar los datos", 
                    details: error.message 
                });
            }
            
            resolve();
        });
    });
}