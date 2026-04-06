import AccountsReceivable from '../../../models/AccountsReceivableModel';
import { authenticateToken } from '../../../lib/auth';

export default async function handler(req, res) {
    return new Promise((resolve) => {
        authenticateToken(req, res, async () => {
            const { method, query } = req;
            const { id: userId, role: userRole } = req.user;

            try {
                switch (method) {
                    case 'GET':
                        // Filtro: Admin ve todo, vendedor solo lo suyo
                        const whereClause = userRole === 'admin' ? {} : { userId };
                        const data = await AccountsReceivable.findAll({ 
                            where: whereClause,
                            order: [['diasAtraso', 'DESC']] 
                        });
                        res.status(200).json(data);
                        break;

                    case 'POST':
                        // LÓGICA MANUAL: El formulario envía el objeto directamente
                        const { clienteId, clienteNombre, folio, fechaFactura, fechaVencimiento, saldo, diasAtraso } = req.body;

                        // Validamos campos mínimos obligatorios
                        if (!clienteId || !folio || !saldo) {
                            return res.status(400).json({ message: "Faltan campos obligatorios (Cliente, Folio o Saldo)" });
                        }

                        const newRecord = await AccountsReceivable.create({
                            clienteId: parseInt(clienteId),
                            clienteNombre,
                            folio,
                            fechaFactura,
                            fechaVencimiento,
                            saldo: parseFloat(saldo),
                            diasAtraso: parseInt(diasAtraso) || 0,
                            userId // ID del asesor que está guardando
                        });

                        res.status(201).json(newRecord);
                        break;

                    case 'DELETE':
                        // Si viene un ID en la URL (?id=5), borramos ese registro
                        if (query.id) {
                            const recordToDelete = await AccountsReceivable.findByPk(query.id);
                            
                            if (!recordToDelete) return res.status(404).json({ message: "No se encontró el registro" });
                            
                            // Seguridad: Solo el dueño o un admin pueden borrar
                            if (userRole !== 'admin' && recordToDelete.userId !== userId) {
                                return res.status(403).json({ message: "No tienes permiso para borrar este registro" });
                            }

                            await recordToDelete.destroy();
                            return res.status(200).json({ message: "Registro eliminado" });
                        }

                        // Si NO viene ID, es la opción de "limpiar todo" del vendedor
                        const deleteWhere = userRole === 'admin' ? {} : { userId };
                        await AccountsReceivable.destroy({ where: deleteWhere });
                        res.status(200).json({ message: "Cartera limpiada" });
                        break;

                    default:
                        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                        res.status(405).end();
                }
            } catch (error) {
                console.error("API Error:", error);
                res.status(500).json({ message: "Error interno del servidor", error: error.message });
            }
            resolve();
        });
    });
}