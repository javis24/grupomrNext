import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Obtener todas las citas del usuario autenticado
      authenticateToken(req, res, async () => {
        try {
          // Filtrar citas por el userId del usuario autenticado
          const appointments = await Appointments.findAll({
            where: { userId: req.user.id }, // Usar req.user.id para obtener solo las citas del usuario autenticado
            include: [
              { model: Users, attributes: ['name', 'email'] }, // Para obtener información adicional del usuario
            ],
          });
          res.status(200).json(appointments);
        } catch (error) {
          console.error('Error fetching appointments:', error);
          res.status(500).json({ message: 'Error fetching appointments' });
        }
      });
      break;

    case 'POST':
      // Crear una nueva cita
      authenticateToken(req, res, async () => {
        const { date, clientName, clientStatus } = req.body;

        if (!date || !clientName || !clientStatus) {
          return res.status(400).json({ message: 'Todos los campos son necesarios' });
        }

        try {
          const newAppointment = await Appointments.create({
            date,
            clientName,
            clientStatus,
            userId: req.user.id, // Asignar el userId del usuario autenticado
          });

          res.status(201).json({ message: 'Cita creada con éxito', appointment: newAppointment });
        } catch (error) {
          console.error('Error creando la cita:', error);
          res.status(500).json({ message: 'Error creando la cita' });
        }
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
