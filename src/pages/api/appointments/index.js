import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';
import Users from '../../../models/UserModel';
import Clients from '../../../models/ClientModel';
export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    const { role, id: loggedUserId } = req.user;

    try {
      switch (method) {
        case 'GET': {
          const queryOptions = {
            attributes: ['id', 'date', 'clientName', 'clientStatus', 'assignedTo', 'userId', 'appointmentTime', 'comments'],
            include: [
              { model: Users, attributes: ['id', 'name', 'email'] },
              { model: Users, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
              { 
                model: Clients, 
                as: 'datosCliente', 
                attributes: ['contactPhone'] 
              }               
            ],           
          };

          if (role !== 'admin' && role !== 'gerencia') {
            queryOptions.where = { assignedTo: loggedUserId };
          }

          const appointments = await Appointments.findAll(queryOptions);
          return res.status(200).json(appointments || []);
        }

        case 'POST': {
          const { date, clientName, clientStatus, assignedTo, appointmentTime, comments } = req.body;
        
          // CORRECCIÓN: Quitamos 'comments' de la validación obligatoria
          if (!date || !clientName || !clientStatus || !assignedTo || !appointmentTime) {
            return res.status(400).json({ message: 'Todos los campos (excepto comentarios) son requeridos' });
          }
        
          const newAppointment = await Appointments.create({
            date: new Date(date),
            clientName,
            clientStatus,
            assignedTo: parseInt(assignedTo),
            userId: loggedUserId,
            appointmentTime,
            comments: comments || "" // Si no hay comentario, guardamos string vacío
          });
        
          const fullAppointment = await Appointments.findByPk(newAppointment.id, {
            include: [
              { model: Users, attributes: ['id', 'name', 'email'] },
              { model: Users, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
              { model: Clients, as: 'datosCliente', attributes: ['contactPhone'] } // Incluimos esto para el frontend
            ],
          });
        
          return res.status(201).json(fullAppointment);
        }

        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).end(`Method ${method} Not Allowed`);
      }
    } catch (error) {
      console.error('DETALLE DEL ERROR EN APPOINTMENTS:', error);
      return res.status(500).json({ 
        message: 'Error al procesar la cita', 
        error: error.message 
      });
    }
  });
}