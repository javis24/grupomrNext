import { authenticateToken } from '../../../lib/auth';
import Prospect from '../../../models/ProspectModel';
import Users from '../../../models/UserModel';
import { Op } from 'sequelize';

export default async function handler(req, res) {
  return authenticateToken(req, res, async () => {
    const { method } = req;
    const { id: loggedUserId, role, email: loggedUserEmail } = req.user;

    try {
      switch (method) {
        case 'GET': {
          const whereClause =
            role === 'admin' || role === 'gerencia'
              ? {}
              : { userId: loggedUserId };

          const prospects = await Prospect.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
          });

          const canViewAssignedSeller =
            String(loggedUserEmail || '').trim().toLowerCase() ===
            'direccion@grupomrlaguna.com';

          if (!canViewAssignedSeller) {
            return res.status(200).json(prospects);
          }

          const sellerIds = [
            ...new Set(
              prospects
                .map((prospect) => prospect.userId)
                .filter((userId) => userId !== null && userId !== undefined)
            ),
          ];

          const sellers = sellerIds.length > 0
            ? await Users.findAll({
                where: {
                  id: {
                    [Op.in]: sellerIds,
                  },
                },
                attributes: ['id', 'name', 'email'],
              })
            : [];

          const sellersById = new Map(
            sellers.map((seller) => [Number(seller.id), seller.toJSON()])
          );

          const prospectsWithSeller = prospects.map((prospect) => ({
            ...prospect.toJSON(),
            assignedSeller: sellersById.get(Number(prospect.userId)) || null,
          }));

          return res.status(200).json(prospectsWithSeller);
        }

        case 'POST': {
          const {
            saleProcess,
            contactName,
            company,
            address,
            phone,
            email,
            planta,
          } = req.body;

          if (!saleProcess || !contactName || !company || !phone || !email) {
            return res.status(400).json({
              message: 'Todos los campos son obligatorios',
            });
          }

          const newProspect = await Prospect.create({
            saleProcess,
            contactName,
            company,
            address,
            phone,
            email,
            planta: planta && String(planta).trim() !== ''
              ? String(planta).trim()
              : null,
            userId: loggedUserId,
          });

          return res.status(201).json(newProspect);
        }

        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({
            message: `Método ${method} no permitido`,
          });
      }
    } catch (error) {
      console.error('Error API prospects:', error);

      return res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  });
}