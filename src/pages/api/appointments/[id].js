import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';

export default async function handler(req, res) {
  const { id } = req.query;

  authenticateToken(req, res, async () => {
    const { method } = req;

    switch (method) {
      case 'GET':
        try {
          const appointment = await Appointments.findByPk(id);
          if (!appointment) return res.status(404).json({ message: "Cita no encontrada" });
          res.status(200).json(appointment);
        } catch (error) {
          console.error('Error fetching appointment:', error);
          res.status(500).json({ message: 'Error al obtener la cita' });
        }
        break;

      case 'PUT':
        // 1. Incluimos los nuevos campos en la desestructuración
        const { date, clientName, clientStatus, assignedTo, appointmentTime, comments } = req.body;

        // 2. Validación corregida (comments no es obligatorio)
        if (!date || !clientName || !clientStatus || !assignedTo || !appointmentTime) {
          return res.status(400).json({ message: "Todos los campos obligatorios son necesarios" });
        }

        try {
          const appointment = await Appointments.findByPk(id);
          if (!appointment) return res.status(404).json({ message: "Cita no encontrada" });

          // 3. Actualizamos todos los campos
          await appointment.update({
            date: new Date(date),
            clientName,
            clientStatus,
            assignedTo: parseInt(assignedTo),
            appointmentTime,
            comments: comments || "" // Si viene null o undefined, ponemos vacío
          });

          res.status(200).json({ message: "Cita actualizada con éxito", appointment });
        } catch (error) {
          console.error('Error actualizando la cita:', error);
          res.status(500).json({ message: 'Error interno al actualizar la cita', error: error.message });
        }
        break;

      case 'DELETE':
        try {
          const appointment = await Appointments.findByPk(id);
          if (!appointment) return res.status(404).json({ message: "Cita no encontrada" });

          await appointment.destroy();
          res.status(200).json({ message: "Cita eliminada con éxito" });
        } catch (error) {
          console.error('Error eliminando la cita:', error);
          res.status(500).json({ message: 'Error eliminando la cita' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  });
}