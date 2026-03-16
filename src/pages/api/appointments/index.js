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
              attributes: ['id', 'date', 'clientName', 'clientStatus', 'assignedTo', 'userId'],
              
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
          const { date, clientName, clientStatus, assignedTo } = req.body;
        
          // Validación: assignedTo puede venir como string del select, hay que convertirlo
          if (!date || !clientName || !clientStatus || !assignedTo) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
          }
        
          const newAppointment = await Appointments.create({
            date: new Date(date), // Aseguramos formato Date
            clientName,
            clientStatus,
            assignedTo: parseInt(assignedTo), // Forzamos número para MySQL
            userId: loggedUserId,
          });
        
          // Recargar con relaciones para devolver al frontend el objeto completo
          const fullAppointment = await Appointments.findByPk(newAppointment.id, {
            include: [
              {
                model: Users,
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
      // ESTO ES CLAVE: Ver el error real en los logs de Vercel
      console.error('DETALLE DEL ERROR EN APPOINTMENTS:', error);
      return res.status(500).json({ 
        message: 'Error al procesar la cita', 
        error: error.message 
      });
    }
  });
}