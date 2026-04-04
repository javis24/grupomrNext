import { authenticateToken } from '../../../lib/auth';
import Products from '../../../models/ProductsModel';

export default async function handler(req, res) {
    const { id } = req.query;

    authenticateToken(req, res, async () => {
        const { method } = req;
        const { role } = req.user; 

        try {
            const product = await Products.findByPk(id);
            if (!product) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

       
            if (method === 'PUT' || method === 'DELETE') {
                if (role !== 'admin') {
                    return res.status(403).json({ 
                        message: "Acceso denegado: Solo administradores pueden gestionar el catálogo de productos." 
                    });
                }
            }

   
            if (method === 'PUT') {
                const { name, description, unitMeasure, leadTime, cost, price } = req.body;
                await product.update({
                    name,
                    description,
                    unitMeasure,
                    leadTime,
                    cost: parseFloat(cost),
                    price: parseFloat(price)
                });
                return res.status(200).json({ message: "Producto actualizado con éxito" });
            }

     
            if (method === 'DELETE') {
                await product.destroy();
                return res.status(200).json({ message: "Producto eliminado correctamente" });
            }

            res.setHeader('Allow', ['PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error interno", error: error.message });
        }
    });
}