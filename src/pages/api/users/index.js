import Clients from '../../../models/ClientModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        authenticateToken(req, res, async () => {
            try {
                const clients = await Clients.findAll();
                res.status(200).json(clients);
            } catch (error) {
                console.error('Error fetching clients:', error);
                res.status(500).json({ message: 'Error fetching clients' });
            }
        });
    } else if (req.method === 'POST') {
        authenticateToken(req, res, async () => {
            const { role: userRole, id: userId } = req.user;

            if (userRole !== 'admin' && userRole !== 'gerencia') {
                return res.status(403).json({ message: "No tienes permiso para crear clientes" });
            }

            const { fullName, contactName, contactPhone, position } = req.body;

            if (!fullName) {
                return res.status(400).json({ message: "Full Name es necesario" });
            }

            try {
                const newClient = await Clients.create({
                    fullName,
                    contactName,
                    contactPhone,
                    position,
                    userId, // Asociar el cliente al usuario autenticado
                });

                res.status(201).json({ message: "Cliente creado con éxito", client: newClient });
            } catch (error) {
                console.error('Error creando el cliente:', error);
                res.status(500).json({ message: error.message });
            }
        });
    } else if (req.method === 'PUT') {
        authenticateToken(req, res, async () => {
            const { role: userRole, id: userId } = req.user;

            if (userRole !== 'admin' && userRole !== 'gerencia') {
                return res.status(403).json({ message: "No tienes permiso para actualizar clientes" });
            }

            const { id, fullName, contactName, contactPhone, position } = req.body;

            if (!id) {
                return res.status(400).json({ message: "ID del cliente es necesario" });
            }

            try {
                const client = await Clients.findByPk(id);

                if (!client) {
                    return res.status(404).json({ message: "Cliente no encontrado" });
                }

                // Actualizar cliente
                client.fullName = fullName || client.fullName;
                client.contactName = contactName || client.contactName;
                client.contactPhone = contactPhone || client.contactPhone;
                client.position = position || client.position;

                await client.save();
                res.status(200).json({ message: "Cliente actualizado con éxito", client });
            } catch (error) {
                console.error('Error actualizando el cliente:', error);
                res.status(500).json({ message: error.message });
            }
        });
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
