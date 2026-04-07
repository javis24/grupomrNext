import { authenticateToken } from '../../../lib/auth';
import Products from '../../../models/ProductsModel';

export default async function handler(req, res) {
    const { id } = req.query;

    authenticateToken(req, res, async () => {
        const { method } = req;
        const { role } = req.user; 

        try {
            const product = await Products.findByPk(id);
            if (!product) return res.status(404).json({ message: "Producto no encontrado" });

            // SEGURIDAD: Solo admin edita o borra
            if (method === 'PUT' || method === 'DELETE') {
                if (role !== 'admin' && role !== 'gerencia') {
                    return res.status(403).json({ message: "Acceso denegado: Se requieren permisos de administrador." });
                }
            }

            if (method === 'PUT') {
                const { code, name, description, unitMeasure, leadTime, cost, price, businessUnit } = req.body;
                await product.update({
                    code, name, description, unitMeasure, leadTime, businessUnit,
                    cost: parseFloat(cost || 0),
                    price: parseFloat(price || 0)
                });
                return res.status(200).json({ message: "Actualizado con éxito" });
            }

            if (method === 'DELETE') {
                await product.destroy();
                return res.status(200).json({ message: "Eliminado correctamente" });
            }

            res.setHeader('Allow', ['PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);

        } catch (error) {
            return res.status(500).json({ message: "Error interno", error: error.message });
        }
    });
}