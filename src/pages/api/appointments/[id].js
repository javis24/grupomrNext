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
                    if (!appointment) {
                        return res.status(404).json({ message: "Cita no encontrada" });
                    }
                    res.status(200).json(appointment);
                } catch (error) {
                    console.error('Error fetching appointment:', error);
                    res.status(500).json({ message: 'Error fetching appointment' });
                }
                break;

            case 'PUT':
                const { date, clientName, clientStatus } = req.body;

                if (!date || !clientName || !clientStatus) {
                    return res.status(400).json({ message: "Todos los campos son necesarios" });
                }

                try {
                    const appointment = await Appointments.findByPk(id);

                    if (!appointment) {
                        return res.status(404).json({ message: "Cita no encontrada" });
                    }

                    appointment.date = date;
                    appointment.clientName = clientName;
                    appointment.clientStatus = clientStatus;

                    await appointment.save();
                    res.status(200).json({ message: "Cita actualizada con éxito", appointment });
                } catch (error) {
                    console.error('Error actualizando la cita:', error);
                    res.status(500).json({ message: 'Error actualizando la cita' });
                }
                break;

            case 'DELETE':
                try {
                    const appointment = await Appointments.findByPk(id);

                    if (!appointment) {
                        return res.status(404).json({ message: "Cita no encontrada" });
                    }

                    await appointment.destroy();
                    res.status(200).json({ message: "Cita eliminada con éxito" });
                } catch (error) {
                    console.error('Error eliminando la cita:', error);
                    res.status(500).json({ message: 'Error eliminando la cita' });
                }
                break;

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    });
}
