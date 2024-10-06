import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    const { role, id: userId } = req.user;

    try {
      switch (method) {
        case 'GET': {
          const queryOptions = {
            attributes: ['id', 'date', 'clientName', 'clientStatus'], // Evitar enviar todos los atributos
            include: [
              {
                model: Users,
                as: 'user',
                attributes: ['id', 'name', 'email'],
              },
            ],
          };

          if (role === 'vendedor') {
            queryOptions.where = { userId };
          }

          const appointments = await Appointments.findAll(queryOptions);

          if (!appointments || appointments.length === 0) {
            return res.status(204).json({ message: 'No appointments found' });
          }

          return res.status(200).json(appointments);
        }

        case 'POST': {
          const { date, clientName, clientStatus } = req.body;

          if (!date || !clientName || !clientStatus) {
            return res.status(400).json({ message: 'Required fields are missing' });
          }

          const newAppointment = await Appointments.create({
            date,
            clientName,
            clientStatus,
            userId,
          });

          return res.status(201).json(newAppointment);
        }

        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).end(`Method ${method} Not Allowed`);
      }
    } catch (error) {
      console.error('Error handling /api/appointments:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
}
