import ClientePriceModel from '../../../models/ClientPriceModel.js';

export default async function handler(req, res) {
  const { method } = req;

  // IMPORTANTE: Envolatamos todo en un try/catch global para evitar que la API muera
  try {
    switch (method) {
      case 'GET':
        const allClients = await ClientePriceModel.findAll();
        return res.status(200).json(allClients);

      case 'POST':
        const { clients } = req.body;
        if (!clients || !Array.isArray(clients)) {
          return res.status(400).json({ error: 'Datos inválidos' });
        }
        await ClientePriceModel.bulkCreate(clients, {
          updateOnDuplicate: ['contacto', 'puesto', 'telefono', 'email', 'ubicacion']
        });
        return res.status(201).json({ message: 'Sincronizado' });

      case 'PUT':
        const { uuid: uuidEdit, asesorcomercial } = req.body;
        await ClientePriceModel.update({ asesorcomercial }, { where: { uuid: uuidEdit } });
        return res.status(200).json({ message: 'Actualizado' });

      case 'DELETE':
        const { uuid } = req.body; // Asegúrate de que el frontend envíe { uuid: "..." }
        if (!uuid) {
          return res.status(400).json({ error: 'Falta el UUID' });
        }
        
        const deleted = await ClientePriceModel.destroy({ where: { uuid } });
        
        if (deleted) {
          return res.status(200).json({ message: 'Eliminado correctamente' });
        } else {
          return res.status(404).json({ error: 'No se encontró el registro' });
        }

      default:
        // Si entra un método que no definimos (ej. PATCH), respondemos esto:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("API ERROR:", error);
    // IMPORTANTE: Siempre enviar respuesta incluso en error
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}