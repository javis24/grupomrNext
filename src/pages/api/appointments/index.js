import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    const { role, id: loggedUserId } = req.user;

    try {
      switch (method) {
        case 'GET': {
          const queryOptions = {
            attributes: ['id', 'date', 'clientName', 'clientStatus', 'assignedTo'],
            include: [
              {
                model: Users,
                as: 'user', // quien creó la cita
                attributes: ['id', 'name', 'email'],
              },
              {
                model: Users,
                as: 'assignedUser', // asesor asignado
                attributes: ['id', 'name', 'email'],
              },
            ],            
          };
        
          if (role !== 'admin') {
            // Si NO es admin, solo ver las citas asignadas a ese usuario
            queryOptions.where = { assignedTo: loggedUserId };
          }
        
          const appointments = await Appointments.findAll(queryOptions);
        
          if (!appointments || appointments.length === 0) {
            return res.status(204).json({ message: 'No appointments found' });
          }
        
          return res.status(200).json(appointments);
        }
        
        

        case 'POST': {
          const { date, clientName, clientStatus, assignedTo } = req.body;
        
          if (!date || !clientName || !clientStatus || !assignedTo) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
          }
        
          const newAppointment = await Appointments.create({
            date,
            clientName,
            clientStatus,
            assignedTo,
            userId: loggedUserId,
          });
        
          // Recargar con relaciones
          const fullAppointment = await Appointments.findByPk(newAppointment.id, {
            include: [
              {
                model: Users,
                as: 'user',
                attributes: ['id', 'name', 'email'],
              },
              {
                model: Users,
                as: 'assignedUser',
                attributes: ['id', 'name', 'email'],
              },
            ],
          });
        
          return res.status(201).json(fullAppointment);
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
