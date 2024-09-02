// src/pages/api/business-units/[id].js
import { authenticateToken } from '../../../lib/auth';
import BusinessUnit from '../../../models/BusinessUnitModel';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        authenticateToken(req, res, async () => {
            try {
                const businessUnit = await BusinessUnit.findByPk(id);
                if (!businessUnit) {
                    return res.status(404).json({ message: 'Business Unit not found' });
                }
                res.status(200).json(businessUnit);
            } catch (error) {
                res.status(500).json({ message: 'Failed to load business unit' });
            }
        });
    } else if (req.method === 'PUT') {
        authenticateToken(req, res, async () => {
            const { name, companyId } = req.body;

            if (!name || !companyId) {
                return res.status(400).json({ message: "Name and Company ID are required" });
            }

            try {
                const businessUnit = await BusinessUnit.findByPk(id);
                if (!businessUnit) {
                    return res.status(404).json({ message: 'Business Unit not found' });
                }

                businessUnit.name = name;
                businessUnit.companyId = companyId;
                await businessUnit.save();

                res.status(200).json(businessUnit);
            } catch (error) {
                res.status(500).json({ message: 'Failed to update business unit' });
            }
        });
    } else if (req.method === 'DELETE') {
        authenticateToken(req, res, async () => {
            try {
                const businessUnit = await BusinessUnit.findByPk(id);
                if (!businessUnit) {
                    return res.status(404).json({ message: 'Business Unit not found' });
                }

                await businessUnit.destroy();
                res.status(204).end();
            } catch (error) {
                res.status(500).json({ message: 'Failed to delete business unit' });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
