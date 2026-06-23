import { authenticateToken } from '../../../lib/auth';
import Quotes from '../../../models/QuoteModel';
import Users from '../../../models/UserModel';
import {
    buildQuoteCreatePayload,
    buildQuotesWhereClause,
    validateQuotePayload,
} from '../../../lib/quotes/quoteService';

export default async function handler(req, res) {
    return authenticateToken(req, res, async () => {
        const { method } = req;
        const { id: loggedUserId, role } = req.user;

        try {
            if (method === 'GET') {
                const whereClause = buildQuotesWhereClause({
                    role,
                    userId: loggedUserId,
                });

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
                const validationError = validateQuotePayload(req.body);

                if (validationError) {
                    return res.status(400).json({
                        message: validationError,
                    });
                }

                const maxQuoteNumber = await Quotes.max('quoteNumber');
                const quotePayload = buildQuoteCreatePayload({
                    body: req.body,
                    userId: loggedUserId,
                    maxQuoteNumber,
                });

                const newQuote = await Quotes.create(quotePayload);

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
