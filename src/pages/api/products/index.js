import { authenticateToken } from '../../../lib/auth';
import Products from '../../../models/ProductsModel';

export default async function handler(req, res) {
    authenticateToken(req, res, async () => {
        const { method } = req;
        try {
            if (method === 'GET') {
                const products = await Products.findAll();
                return res.status(200).json(products);
            }

            if (method === 'POST') {
                const { code, name, description, unitMeasure, leadTime, cost, price, businessUnit } = req.body;
    
                const newProduct = await Products.create({
                    code, name, description, unitMeasure, leadTime, 
                    cost, price, businessUnit, userId: req.user.id
                });
                return res.status(201).json(newProduct);
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
}