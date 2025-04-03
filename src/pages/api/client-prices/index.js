// /pages/api/client-prices/index.js
import ClientePriceModel from '../../../models/ClientPriceModel.js';

export default async function handler(req, res) {
  // GET: obtener todos
  if (req.method === 'GET') {
    try {
      const allClients = await ClientePriceModel.findAll();
      return res.status(200).json(allClients);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // POST: crear varios (subida masiva de Excel)
  if (req.method === 'POST') {
    try {
      const { clients } = req.body;
      if (!Array.isArray(clients)) {
        return res.status(400).json({ error: 'Los datos enviados no son válidos' });
      }

      // Crea todos de golpe
      await ClientePriceModel.bulkCreate(clients);
      return res.status(201).json({ message: 'Clientes creados correctamente' });
    } catch (error) {
      console.error('Error al crear clientes:', error);
      return res.status(500).json({ error: 'Error interno al crear clientes' });
    }
  }

  // DELETE: eliminar un registro por uuid
  if (req.method === 'DELETE') {
    try {
      const { uuid } = req.body;
      if (!uuid) {
        return res.status(400).json({ error: 'Falta el UUID para eliminar' });
      }

      await ClientePriceModel.destroy({
        where: { uuid },
      });

      return res.status(200).json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      return res.status(500).json({ error: 'Error interno al eliminar cliente' });
    }
  }

  // Si no es GET, POST o DELETE, no está permitido
  return res.status(405).json({ error: 'Método no permitido' });
}
