import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';
import Users from '../../../models/UserModel';

export default async function handler(req, res) {
    if (req.method === 'POST') {
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
                res.status(500).json({ message: 'Error creando la cita' });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
