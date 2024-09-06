import Servicios from '../../../models/ServiciosModel'; // Asegúrate de tener bien importado el modelo
import { authenticateToken } from '../../../lib/auth'; // Si usas autenticación con JWT

export default async function handler(req, res) {
  // Verifica el método HTTP
  if (req.method === 'GET') {
    // Obtener todos los servicios
    authenticateToken(req, res, async () => {
      try {
        const servicios = await Servicios.findAll(); // Traer todos los registros de servicios
        res.status(200).json(servicios);
      } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Error fetching services' });
      }
    });
  } else if (req.method === 'POST') {
    // Crear un nuevo servicio
    authenticateToken(req, res, async () => {
      const { programacion, equipo, numeroEconomico, contenido, manifiesto, generado, renta2024, recoleccion, disposicion, contacto, telefono, email, ubicacion, rfc, userId } = req.body;

      try {
        const newService = await Servicios.create({
          programacion,
          equipo,
          numeroEconomico,
          contenido,
          manifiesto,
          generado,
          renta2024,
          recoleccion,
          disposicion,
          contacto,
          telefono,
          email,
          ubicacion,
          rfc,
          userId
        });
        res.status(201).json({ message: 'Servicio creado exitosamente', servicio: newService });
      } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Error creating service' });
      }
    });
  } else if (req.method === 'PUT') {
    // Actualizar un servicio existente
    authenticateToken(req, res, async () => {
      const { id } = req.query;
      const { programacion, equipo, numeroEconomico, contenido, manifiesto, generado, renta2024, recoleccion, disposicion, contacto, telefono, email, ubicacion, rfc, userId } = req.body;

      try {
        const service = await Servicios.findByPk(id);
        if (!service) {
          return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // Actualizamos los campos
        service.programacion = programacion || service.programacion;
        service.equipo = equipo || service.equipo;
        service.numeroEconomico = numeroEconomico || service.numeroEconomico;
        service.contenido = contenido || service.contenido;
        service.manifiesto = manifiesto || service.manifiesto;
        service.generado = generado || service.generado;
        service.renta2024 = renta2024 || service.renta2024;
        service.recoleccion = recoleccion || service.recoleccion;
        service.disposicion = disposicion || service.disposicion;
        service.contacto = contacto || service.contacto;
        service.telefono = telefono || service.telefono;
        service.email = email || service.email;
        service.ubicacion = ubicacion || service.ubicacion;
        service.rfc = rfc || service.rfc;
        service.userId = userId || service.userId;

        await service.save();
        res.status(200).json({ message: 'Servicio actualizado exitosamente', servicio: service });
      } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Error updating service' });
      }
    });
  } else if (req.method === 'DELETE') {
    // Eliminar un servicio
    authenticateToken(req, res, async () => {
      const { id } = req.query;

      try {
        const service = await Servicios.findByPk(id);
        if (!service) {
          return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        await service.destroy();
        res.status(200).json({ message: 'Servicio eliminado exitosamente' });
      } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Error deleting service' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
