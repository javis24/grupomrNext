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
      comments: comments || ""
    });

    const fullAppointment = await Appointments.findByPk(newAppointment.id, {
      include: [
        { model: Users, attributes: ['id', 'name', 'email'] },
        { model: Users, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
        { model: Clients, as: 'datosCliente', attributes: ['contactPhone'] }
      ],
    });

    return res.status(201).json(fullAppointment);
  }

  case 'DELETE': {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'ID de cita requerido' });
    }

    if (role !== 'admin') {
      return res.status(403).json({
        message: 'Acceso denegado: Solo el perfil de Administrador puede eliminar citas'
      });
    }

    const appointment = await Appointments.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    await appointment.destroy();

    return res.status(200).json({
      message: 'Cita eliminada correctamente'
    });
  }

  default:
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
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