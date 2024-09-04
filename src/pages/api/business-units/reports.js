import jwt from 'jsonwebtoken'; // Importa jsonwebtoken
import { authenticateToken } from '../../../lib/auth';
import BusinessUnit from '../../../models/BusinessUnitModel';
import Company from '../../../models/CompanyModel';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        authenticateToken(req, res, async () => {
            const { description, total, unitName } = req.body;

            if (!description || !total || !unitName) {
                return res.status(400).json({ message: "Todos los campos son necesarios" });
            }

            try {
                // Asocia la unidad de negocio con la compañía del usuario autenticado
                const company = await Company.findOne({ where: { userId: req.user.id } });
                if (!company) {
                    return res.status(404).json({ message: "Compañía no encontrada para este usuario" });
                }

                // Crea el reporte de la unidad de negocio
                const newReport = await BusinessUnit.create({
                    name: unitName,
                    description,
                    total,
                    companyId: company.id,
                });

                res.status(201).json(newReport);
            } catch (error) {
                console.error('Error al crear reporte:', error);
                res.status(500).json({ message: 'Error al crear reporte' });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
