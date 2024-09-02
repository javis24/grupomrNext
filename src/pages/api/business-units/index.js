// src/pages/api/business-units/index.js
import { authenticateToken } from '../../../lib/auth';
import BusinessUnit from '../../../models/BusinessUnitModel';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        authenticateToken(req, res, async () => {
            try {
                const businessUnits = await BusinessUnit.findAll();
                res.status(200).json(businessUnits);
            } catch (error) {
                res.status(500).json({ message: 'Failed to load business units' });
            }
        });
    } else if (req.method === 'POST') {
        authenticateToken(req, res, async () => {
            const { name, companyId } = req.body;

            if (!name || !companyId) {
                return res.status(400).json({ message: "Name and Company ID are required" });
            }

            try {
                const newBusinessUnit = await BusinessUnit.create({ name, companyId });
                res.status(201).json(newBusinessUnit);
            } catch (error) {
                res.status(500).json({ message: 'Failed to create business unit' });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
