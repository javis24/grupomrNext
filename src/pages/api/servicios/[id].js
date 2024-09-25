import Servicios from '../../../models/ServicioModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    authenticateToken(req, res, async () => {
      const { role: userRole, id: userId } = req.user;
      const { programacion, equipo, numeroEconomico, contenido, manifiesto, renta2024, recoleccion, disposicion, contacto, telefono, email, ubicacion, rfc } = req.body;

      try {
        const service = await Servicios.findByPk(id);
        if (!service) {
          return res.status(404).json({ message: 'Service not found' });
        }

        // Verificar permisos para actualizar
        if (userRole === 'vendedor' && service.userId !== userId) {
          return res.status(403).json({ message: 'You do not have permission to update this service' });
        }

        // Actualizar servicio
        service.programacion = programacion || service.programacion;
        service.equipo = equipo || service.equipo;
        service.numeroEconomico = numeroEconomico || service.numeroEconomico;
        service.contenido = contenido || service.contenido;
        service.manifiesto = manifiesto || service.manifiesto;
        service.renta2024 = renta2024 || service.renta2024;
        service.recoleccion = recoleccion || service.recoleccion;
        service.disposicion = disposicion || service.disposicion;
        service.contacto = contacto || service.contacto;
        service.telefono = telefono || service.telefono;
        service.email = email || service.email;
        service.ubicacion = ubicacion || service.ubicacion;
        service.rfc = rfc || service.rfc;

        await service.save();

        return res.status(200).json({ message: "Service updated successfully", service });
      } catch (error) {
        console.error('Error updating service:', error);
        return res.status(500).json({ message: 'Error updating service' });
      }
    });
  } else if (req.method === 'DELETE') {
    authenticateToken(req, res, async () => {
      const { role: userRole, id: userId } = req.user;

      try {
        const service = await Servicios.findByPk(id);
        if (!service) {
          return res.status(404).json({ message: 'Service not found' });
        }

        // Verificar permisos para eliminar
        if (userRole === 'vendedor' && service.userId !== userId) {
          return res.status(403).json({ message: 'You do not have permission to delete this service' });
        }

        await service.destroy();

        return res.status(200).json({ message: 'Service deleted successfully' });
      } catch (error) {
        console.error('Error deleting service:', error);
        return res.status(500).json({ message: 'Error deleting service' });
      }
    });
  } else {
    return res.setHeader('Allow', ['PUT', 'DELETE']).status(405).end(`Method ${req.method} Not Allowed`);
  }
}
