import Sales from '../../../models/SalesModel';
import sequelize from '../../../config/Database';

export default async function handler(req, res) {
  // Sincroniza los modelos con la base de datos 
  // (¡Ojo! Ideal para desarrollo; en producción es mejor usar migraciones)
  await sequelize.sync();

  switch (req.method) {
    case 'GET':
      try {
        const sales = await Sales.findAll({
          // Incluir también los nuevos campos
          attributes: [
            'id',
            'year',
            'month',
            'sale',
            'previousSale',
            'unitName',
            'createdAt',
            'updatedAt',
          ],
        });
        res.status(200).json(sales);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
      }
      break;

    case 'POST': {
      // Esperamos que vengan los nuevos campos en el body
      const { year, month, sale, previousSale, unitName } = req.body;

      // Valida que los campos requeridos estén presentes
      if (
        !year ||
        !month ||
        sale === undefined ||
        isNaN(sale) ||
        previousSale === undefined ||
        isNaN(previousSale) ||
        !unitName
      ) {
        return res.status(400).json({
          error: 'Todos los campos son requeridos y deben ser números válidos (sale, previousSale) o cadenas (month, unitName).',
        });
      }

      try {
        // Crea el registro con los nuevos campos
        const newSale = await Sales.create({
          year,
          month,
          sale,
          previousSale,
          unitName,
        });
        res.status(201).json(newSale);
      } catch (error) {
        console.error('Error al guardar los datos:', error);
        res.status(500).json({ error: 'Hubo un error al guardar los datos.' });
      }
      break;
    }

    case 'PUT':
      try {
        // Incluimos los nuevos campos en la actualización
        const { id, year, month, sale, previousSale, unitName } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ error: 'El campo "id" es requerido para actualizar.' });
        }

        const saleToUpdate = await Sales.findByPk(id);
        if (!saleToUpdate) {
          return res
            .status(404)
            .json({ error: 'Registro no encontrado.' });
        }

        // Actualiza también los nuevos campos
        await saleToUpdate.update({
          year,
          month,
          sale,
          previousSale,
          unitName,
        });

        res.status(200).json(saleToUpdate);
      } catch (error) {
        console.error('Error al actualizar los datos:', error);
        res.status(500).json({ error: 'Error al actualizar los datos.' });
      }
      break;

    case 'DELETE': {
      const { id } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ error: 'ID es requerido para eliminar' });
      }

      try {
        const saleToDelete = await Sales.findByPk(id);
        if (!saleToDelete) {
          return res
            .status(404)
            .json({ error: 'Registro no encontrado' });
        }

        await saleToDelete.destroy();
        res.status(200).json({ message: 'Registro eliminado con éxito' });
      } catch (error) {
        console.error('Error al eliminar registro:', error);
        res.status(500).json({ error: 'Error al eliminar registro' });
      }
      break;
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
