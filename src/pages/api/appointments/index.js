import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Obtener todas las citas
        authenticateToken(req, res, async () => {
            try {
                const appointments = await Appointments.findAll({
                    include: [
                        { model: Users, attributes: ['name', 'email'] } // Para obtener información adicional del usuario
                    ]
                });
                res.status(200).json(appointments);
            } catch (error) {
                console.error('Error fetching appointments:', error);
                res.status(500).json({ message: 'Error fetching appointments' });
            }
        });
    } else if (req.method === 'POST') {
        // Crear una nueva cita
        authenticateToken(req, res, async () => {
            const { date, clientName, clientStatus, userId } = req.body;

            if (!date || !clientName || !clientStatus || !userId) {
                return res.status(400).json({ message: "Todos los campos son necesarios" });
            }

            try {
                const newAppointment = await Appointments.create({
                    date,
                    clientName,
                    clientStatus,
                    userId
                });

                res.status(201).json({ message: "Cita creada con éxito", appointment: newAppointment });
            } catch (error) {
                console.error('Error creando la cita:', error);
                res.status(500).json({ message: error.message });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
