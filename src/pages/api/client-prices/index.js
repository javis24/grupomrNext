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


    // PUT: actualizar "asesorcomercial" en un registro existente
  if (req.method === 'PUT') {
    try {
      const { uuid, asesorcomercial } = req.body;

      // Validaciones mínimas
      if (!uuid) {
        return res
          .status(400)
          .json({ error: 'Falta el UUID para identificar al cliente' });
      }
      if (!asesorcomercial) {
        return res
          .status(400)
          .json({ error: 'Falta el nuevo asesor comercial' });
      }

      // Actualizar en la base de datos
      await ClientePriceModel.update(
        { asesorcomercial },
        { where: { uuid } }
      );

      return res.status(200).json({
        message: 'Asesor comercial asignado/actualizado correctamente',
      });
    } catch (error) {
      console.error('Error al asignar asesor:', error);
      return res
        .status(500)
        .json({ error: 'Error interno al asignar asesor' });
    }
  }

  // Si no es GET, POST o DELETE, no está permitido
  return res.status(405).json({ error: 'Método no permitido' });
}
