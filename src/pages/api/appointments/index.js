import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
  const { method } = req;

  authenticateToken(req, res, async () => {
    try {
      switch (method) {
        case 'GET':
          // Obtener todas las citas del usuario autenticado
          const appointments = await Appointments.findAll({
            where: { userId: req.user.id }, // Usar req.user.id para obtener solo las citas del usuario autenticado
            include: [
              { model: Users, attributes: ['name', 'email'] }, // Para obtener información adicional del usuario
            ],
          });

          if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No se encontraron citas' });
          }

          return res.status(200).json(appointments);

        case 'POST':
          // Crear una nueva cita
          const { date, clientName, clientStatus } = req.body;

          if (!date || !clientName || !clientStatus) {
            return res.status(400).json({ message: 'Todos los campos son necesarios' });
          }

          const newAppointment = await Appointments.create({
            date,
            clientName,
            clientStatus,
            userId: req.user.id, // Asignar el userId del usuario autenticado
          });

          return res.status(201).json({ message: 'Cita creada con éxito', appointment: newAppointment });

        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).end(`Method ${method} Not Allowed`);
      }
    } catch (error) {
      console.error('Error en la API de citas:', error);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
  });
}
