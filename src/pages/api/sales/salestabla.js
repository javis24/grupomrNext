import Sales from '../../../models/SalesModel';
import Users from '../../../models/UserModel';
import sequelize from '../../../config/Database';

export default async function handler(req, res) {
    await sequelize.sync(); // Sincroniza los modelos con la base de datos

    switch (req.method) {
        case 'GET':
            try {
                const sales = await Sales.findAll({
                    attributes: ['id', 'year', 'month', 'sale', 'createdAt', 'updatedAt'], // Elimina cualquier referencia a userId
                });
                res.status(200).json(sales);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
                res.status(500).json({ error: 'Error al obtener los datos' });
            }
            break;
        
        case 'POST': {
            const { year, month, sale } = req.body;
        
            if (!year || !month || sale === undefined || isNaN(sale)) {
                return res.status(400).json({ error: 'Todos los campos son requeridos y deben ser números válidos.' });
            }
        
            try {
                const newSale = await Sales.create({ year, month, sale });
                res.status(201).json(newSale);
            } catch (error) {
                console.error('Error al guardar los datos:', error);
                res.status(500).json({ error: 'Hubo un error al guardar los datos.' });
            }
            break;
        }
        
        
        case 'PUT':
            try {
                const { id, year, month, sale } = req.body;

                if (!id || !year || !month || !sale) {
                    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
                }

                const saleToUpdate = await Sales.findByPk(id);

                if (!saleToUpdate) {
                    return res.status(404).json({ error: 'Registro no encontrado.' });
                }

                await saleToUpdate.update({ year, month, sale });
                res.status(200).json(saleToUpdate);
            } catch (error) {
                console.error('Error al actualizar los datos:', error);
                res.status(500).json({ error: 'Error al actualizar los datos.' });
            }
            break;
        case 'DELETE': {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'ID es requerido para eliminar' });
            }

            try {
                const saleToDelete = await Sales.findByPk(id);
                if (!saleToDelete) {
                    return res.status(404).json({ error: 'Registro no encontrado' });
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
