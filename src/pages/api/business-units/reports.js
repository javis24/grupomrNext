// src/pages/api/business-units/reports.js
import { authenticateToken } from '../../../lib/auth';
import BusinessUnit from '../../../models/BusinessUnitModel';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        authenticateToken(req, res, async () => {
            const { unitName, description, total } = req.body;

            if (!unitName || !description || !total) {
                return res.status(400).json({ message: "All fields are required" });
            }

            try {
                // Buscar la unidad de negocio por nombre
                const businessUnit = await BusinessUnit.findOne({ where: { name: unitName } });

                if (!businessUnit) {
                    return res.status(404).json({ message: "Business Unit not found" });
                }

                // Actualizar la descripción y el total en la unidad de negocio
                businessUnit.description = description;
                businessUnit.total = total;
                await businessUnit.save();

                res.status(200).json({ message: 'Report submitted successfully', data: businessUnit });
            } catch (error) {
                console.error('Error saving report:', error);
                res.status(500).json({ message: 'Failed to submit report' });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
