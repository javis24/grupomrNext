import { authenticateToken } from '../../../lib/auth';
import Quotes from '../../../models/QuoteModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
    return authenticateToken(req, res, async () => {
        const { method } = req;
        const { id: loggedUserId, role } = req.user;

        try {
            if (method === 'GET') {
                const whereClause =
                    role === 'admin' || role === 'gerencia'
                        ? {}
                        : { userId: loggedUserId };

                const quotes = await Quotes.findAll({
                    where: whereClause,
                    include: [
                        {
                            model: Users,
                            as: 'assignedUser',
                            attributes: ['name'],
                        },
                    ],
                    order: [
                        ['quoteNumber', 'DESC'],
                        ['createdAt', 'DESC'],
                    ],
                });

                return res.status(200).json(quotes);
            }

            if (method === 'POST') {
                const {
                    companyName,
                    attentionTo,
                    email,
                    phone,
                    total,
                    address,
                    department,
                    supervisor,
                    descripcionGeneral,
                    items,
                    observaciones,
                } = req.body;

                if (!companyName) {
                    return res.status(400).json({
                        message: 'El nombre de la empresa es obligatorio',
                    });
                }

                const maxQuoteNumber = await Quotes.max('quoteNumber');

                const nextQuoteNumber = maxQuoteNumber
                    ? Number(maxQuoteNumber) + 1
                    : 1;

                const newQuote = await Quotes.create({
                    quoteNumber: nextQuoteNumber,
                    companyName,
                    address,
                    attentionTo,
                    department,
                    email,
                    phone,
                    supervisor,
                    descripcionGeneral,
                    items,
                    observaciones,
                    total,
                    userId: loggedUserId,
                });

                return res.status(201).json(newQuote);
            }

            return res.status(405).json({
                message: 'Method not allowed',
            });

        } catch (error) {
            console.error('API ERROR QUOTES:', error);

            return res.status(500).json({
                message: error.message,
            });
        }
    });
}