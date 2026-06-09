import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';
import Users from '../../../models/UserModel';
import Clients from '../../../models/ClientModel';

const includeAppointmentData = [
  { model: Users, attributes: ['id', 'name', 'email'] },
  { model: Users, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
  {
    model: Clients,
    as: 'datosCliente',
    attributes: [
      'id',
      'fullName',
      'companyName',
      'businessTurn',
      'address',
      'contactName',
      'companyPhone',
      'contactPhone',
      'email',
      'position',
      'planta',
      'assignedUser',
    ],
  },
];

export default async function handler(req, res) {
  const { id } = req.query;

  authenticateToken(req, res, async () => {
    const { method } = req;
    const { role, id: loggedUserId } = req.user;

    try {
      const appointment = await Appointments.findByPk(id);

      if (!appointment) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }

      switch (method) {
        case 'GET': {
          if (role === 'vendedor' && appointment.assignedTo !== loggedUserId) {
            return res.status(403).json({
              message: 'No tienes permiso para ver esta cita',
            });
          }

          const fullAppointment = await Appointments.findByPk(id, {
            include: includeAppointmentData,
          });

          return res.status(200).json(fullAppointment);
        }

        case 'PUT': {
          if (role === 'vendedor' && appointment.assignedTo !== loggedUserId) {
            return res.status(403).json({
              message: 'Acceso denegado: No puedes editar citas de otros asesores',
            });
          }

          const {
            date,
            clientName,
            clientStatus,
            assignedTo,
            appointmentTime,
            comments,
          } = req.body;

          if (!date || !clientName || !clientStatus || !assignedTo || !appointmentTime) {
            return res.status(400).json({
              message: 'Todos los campos obligatorios son necesarios',
            });
          }

          await appointment.update({
            date: new Date(date),
            clientName,
            clientStatus,
            assignedTo: role === 'admin' || role === 'gerencia'
              ? parseInt(assignedTo)
              : loggedUserId,
            appointmentTime,
            comments: comments || '',
          });

          const updatedAppointment = await Appointments.findByPk(id, {
            include: includeAppointmentData,
          });

          return res.status(200).json({
            message: 'Cita actualizada con éxito',
            appointment: updatedAppointment,
          });
        }

        case 'DELETE': {
          if (role !== 'admin') {
            return res.status(403).json({
              message: 'Acceso denegado: Solo el perfil de Administrador puede eliminar registros del sistema',
            });
          }

          await appointment.destroy();

          return res.status(200).json({
            message: 'Cita eliminada permanentemente',
          });
        }

        default: {
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).end(`Method ${method} Not Allowed`);
        }
      }
    } catch (error) {
      console.error('ERROR EN API APPOINTMENTS [ID]:', error);

      return res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  });
}