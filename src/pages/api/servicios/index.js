import Servicios from '../../../models/ServicioModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
    const { method } = req;
  
    authenticateToken(req, res, async () => {
      const { role: userRole, id: userId } = req.user;  // Obtener el rol y el ID del usuario autenticado
  
      switch (method) {
        case 'GET': {
          try {
            let services;
            if (userRole === 'vendedor') {
              // Si el usuario es vendedor, solo puede ver los servicios que él creó
              services = await Servicios.findAll({ where: { userId } });
            } else {
              // Si el usuario es admin o gerencia, puede ver todos los servicios
              services = await Servicios.findAll();
            }
  
            if (!services || services.length === 0) {
              return res.status(200).json([]);  // Devolver array vacío si no hay servicios
            }
  
            return res.status(200).json(services);
          } catch (error) {
            console.error('Error fetching services:', error);
            return res.status(500).json({ message: 'Error fetching services' });
          }
        }
  
        case 'POST': {
          const { programacion, equipo, numeroEconomico, contenido, manifiesto, renta2024, recoleccion, disposicion, contacto, telefono, email, ubicacion, rfc } = req.body;
  
          if (!programacion || !equipo || !numeroEconomico || !contenido || !manifiesto || !renta2024 || !recoleccion || !contacto || !telefono || !email || !ubicacion || !rfc) {
            return res.status(400).json({ message: 'Required fields are missing' });
          }
  
          try {
            const newService = await Servicios.create({
              programacion,
              equipo,
              numeroEconomico,
              contenido,
              manifiesto,
              renta2024,
              recoleccion,
              disposicion,
              contacto,
              telefono,
              email,
              ubicacion,
              rfc,
              userId,
            });
  
            return res.status(201).json({ message: 'Service created successfully', service: newService });
          } catch (error) {
            console.error('Error creating service:', error);
            return res.status(500).json({ message: 'Error creating service' });
          }
        }
  
        default:
          return res.setHeader('Allow', ['GET', 'POST']).status(405).json({ message: `Method ${method} Not Allowed` });
      }
    });
  }