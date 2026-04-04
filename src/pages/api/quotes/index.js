import { authenticateToken } from '../../../lib/auth';
import Quotes from '../../../models/QuoteModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
    return authenticateToken(req, res, async () => {
        const { method } = req;
        const { id: loggedUserId, role } = req.user;

        try {
            if (method === 'GET') {
                const whereClause = (role === 'admin' || role === 'gerencia') ? {} : { userId: loggedUserId };
                const quotes = await Quotes.findAll({
                    where: whereClause,
                    include: [{ model: Users, as: 'assignedUser', attributes: ['name'] }],
                    order: [['createdAt', 'DESC']]
                });
                return res.status(200).json(quotes);
            }

            if (method === 'POST') {
                const { companyName, attentionTo, email, phone, total, quoteNumber } = req.body;
                const newQuote = await Quotes.create({
                    quoteNumber, companyName, attentionTo, email, phone, total,
                    userId: loggedUserId
                });
                return res.status(201).json(newQuote);
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
}