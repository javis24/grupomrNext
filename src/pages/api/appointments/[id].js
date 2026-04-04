import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';

export default async function handler(req, res) {
  const { id } = req.query;

  // Usamos el middleware para obtener req.user (id, role, etc)
  authenticateToken(req, res, async () => {
    const { method } = req;
    const { role, id: loggedUserId } = req.user; // Datos extraídos del token JWT

    try {
      // Buscamos la cita primero para validar existencia y propiedad
      const appointment = await Appointments.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      switch (method) {
        case 'GET':
          // REGLA: Si es vendedor, verificar que la cita le pertenezca
          if (role === 'vendedor' && appointment.assignedTo !== loggedUserId) {
            return res.status(403).json({ message: "No tienes permiso para ver esta cita" });
          }
          return res.status(200).json(appointment);

        case 'PUT':
          // REGLA: El vendedor solo puede editar sus propias citas
          if (role === 'vendedor' && appointment.assignedTo !== loggedUserId) {
            return res.status(403).json({ message: "Acceso denegado: No puedes editar citas de otros asesores" });
          }

          const { date, clientName, clientStatus, assignedTo, appointmentTime, comments } = req.body;

          // Validación de campos obligatorios
          if (!date || !clientName || !clientStatus || !assignedTo || !appointmentTime) {
            return res.status(400).json({ message: "Todos los campos obligatorios son necesarios" });
          }

          // Actualización de los campos
          await appointment.update({
            date: new Date(date),
            clientName,
            clientStatus,
            // Si es vendedor, forzamos que se mantenga a sí mismo o validamos el cambio
            assignedTo: role === 'admin' ? parseInt(assignedTo) : loggedUserId,
            appointmentTime,
            comments: comments || ""
          });

          return res.status(200).json({ message: "Cita actualizada con éxito", appointment });

        case 'DELETE':
          // REGLA DE ORO: Solo el administrador puede eliminar registros
          if (role !== 'admin') {
            return res.status(403).json({ 
              message: "Acceso denegado: Solo el perfil de Administrador puede eliminar registros del sistema" 
            });
          }

          await appointment.destroy();
          return res.status(200).json({ message: "Cita eliminada permanentemente" });

        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).end(`Method ${method} Not Allowed`);
      }
    } catch (error) {
      console.error('ERROR EN API APPOINTMENTS [ID]:', error);
      return res.status(500).json({ 
        message: 'Error interno del servidor', 
        error: error.message 
      });
    }
  });
}