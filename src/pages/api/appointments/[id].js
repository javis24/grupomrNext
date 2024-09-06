import { authenticateToken } from '../../../lib/auth';
import Appointments from '../../../models/AppointmentModel';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        authenticateToken(req, res, async () => {
            try {
                const appointment = await Appointments.findByPk(id);
                if (!appointment) {
                    return res.status(404).json({ message: "Cita no encontrada" });
                }
                res.json(appointment);
            } catch (error) {
                console.error('Error fetching appointment:', error);
                res.status(500).json({ message: 'Error fetching appointment' });
            }
        });
    } else if (req.method === 'PUT') {
        authenticateToken(req, res, async () => {
            const { date, clientName, clientStatus } = req.body;

            if (!(date && clientName && clientStatus)) {
                return res.status(400).json({ message: "Todos los campos son necesarios" });
            }

            try {
                const appointment = await Appointments.findByPk(id);

                if (!appointment) {
                    return res.status(404).json({ message: "Cita no encontrada" });
                }

                appointment.date = date || appointment.date;
                appointment.clientName = clientName || appointment.clientName;
                appointment.clientStatus = clientStatus || appointment.clientStatus;

                await appointment.save();

                res.json({ message: "Cita actualizada con éxito", appointment });
            } catch (error) {
                console.error('Error actualizando la cita:', error);
                res.status(500).json({ message: 'Error actualizando la cita' });
            }
        });
    } else if (req.method === 'DELETE') {
        authenticateToken(req, res, async () => {
            try {
                const appointment = await Appointments.findByPk(id);

                if (!appointment) {
                    return res.status(404).json({ message: "Cita no encontrada" });
                }

                await appointment.destroy();
                res.json({ message: "Cita eliminada con éxito" });
            } catch (error) {
                console.error('Error eliminando la cita:', error);
                res.status(500).json({ message: 'Error eliminando la cita' });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
