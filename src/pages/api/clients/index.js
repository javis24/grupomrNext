import Clients from '../../../models/ClientModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Manejo de la autenticación y obtención de clientes
        authenticateToken(req, res, async () => {
            try {
                const clients = await Clients.findAll();
                if (!clients) {
                    return res.status(404).json({ message: 'No clients found' });
                }
                res.status(200).json(clients); // Respuesta exitosa
            } catch (error) {
                console.error('Error fetching clients:', error);
                res.status(500).json({ message: 'Error fetching clients' });
            }
        });
    } else if (req.method === 'POST') {
        // Creación de un nuevo cliente
        authenticateToken(req, res, async () => {
            const { role: userRole, id: userId } = req.user; // Extrae el rol y el id del usuario autenticado

            if (userRole !== 'admin' && userRole !== 'gerencia') {
                return res.status(403).json({ message: "No tienes permiso para crear clientes" });
            }

            const { fullName, companyName, businessTurn, address, contactName, contactPhone, email, position } = req.body;

            if (!fullName || !companyName || !businessTurn || !address) {
                return res.status(400).json({ message: "Full Name, Company Name, Business Turn y Address son necesarios" });
            }

            try {
                const newClient = await Clients.create({
                    fullName,
                    companyName,
                    businessTurn,
                    address,
                    contactName,
                    contactPhone,
                    email,
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
        // Actualización de un cliente
        authenticateToken(req, res, async () => {
            const { role: userRole, id: userId } = req.user;

            if (userRole !== 'admin' && userRole !== 'gerencia') {
                return res.status(403).json({ message: "No tienes permiso para actualizar clientes" });
            }

            const { id, fullName, companyName, businessTurn, address, contactName, contactPhone, email, position } = req.body;

            if (!id) {
                return res.status(400).json({ message: "ID del cliente es necesario" });
            }

            try {
                const client = await Clients.findByPk(id);

                if (!client) {
                    return res.status(404).json({ message: "Cliente no encontrado" });
                }

                client.fullName = fullName || client.fullName;
                client.companyName = companyName || client.companyName;
                client.businessTurn = businessTurn || client.businessTurn;
                client.address = address || client.address;
                client.contactName = contactName || client.contactName;
                client.contactPhone = contactPhone || client.contactPhone;
                client.email = email || client.email;
                client.position = position || client.position;

                await client.save();
                res.status(200).json({ message: "Cliente actualizado con éxito", client });
            } catch (error) {
                console.error('Error actualizando el cliente:', error);
                res.status(500).json({ message: error.message });
            }
        });
    } else {
        // Manejar el caso de un método no permitido
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
