import { authenticateToken } from '../../../lib/auth';
import SalesBusiness from '../../../models/SalesBusinessModel';

export default async function handler(req, res) {
    const { id } = req.query;
    const { method } = req;

    return authenticateToken(req, res, async () => {
        const { id: loggedUserId, role } = req.user;

        try {
            const sale = await SalesBusiness.findByPk(id);

            if (!sale) {
                return res.status(404).json({ message: "Venta no encontrada" });
            }

            // Solo el dueño de la venta o admin/gerencia pueden modificar/eliminar
            if (sale.userId !== loggedUserId && role !== 'admin' && role !== 'gerencia') {
                return res.status(403).json({
                    message: "No tienes permiso para modificar esta venta"
                });
            }

           if (method === 'PUT') {
    const {
        noRemision,
        requiereFactura,
        numeroFactura,
        plazoCredito,
        fechaCotizacion,
        fechaEstimadaPago,
        diasRestantes,
        unitBusiness,
        concepto,
        equipo,
        transporte,
        estadoPago,
        observaciones,
        clientId,
    } = req.body;

    const noRemisionLimpio =
        noRemision && String(noRemision).trim() !== ''
            ? String(noRemision).trim()
            : null;

    let noRemisionFinal = sale.noRemision;

    // Si la venta todavía no tiene remisión, permite capturarla una sola vez
    if (!sale.noRemision && noRemisionLimpio) {
        const existingRemision = await SalesBusiness.findOne({
            where: { noRemision: noRemisionLimpio },
        });

        if (existingRemision) {
            return res.status(400).json({
                message: "El No. Remisión ya existe. Debe ser único.",
            });
        }

        noRemisionFinal = noRemisionLimpio;
    }

    // Si ya tenía remisión y quieren cambiarla, bloquear
    if (
        sale.noRemision &&
        noRemisionLimpio &&
        sale.noRemision !== noRemisionLimpio
    ) {
        return res.status(400).json({
            message: "El No. Remisión ya fue capturado y no puede modificarse.",
        });
    }

    // Si ya tenía remisión y mandan vacío, no permitir borrarlo
    if (sale.noRemision && !noRemisionLimpio) {
        noRemisionFinal = sale.noRemision;
    }

    await sale.update({
        noRemision: noRemisionFinal,

        requiereFactura: requiereFactura || 'Pendiente',

        numeroFactura:
            numeroFactura && String(numeroFactura).trim() !== ''
                ? String(numeroFactura).trim()
                : null,

        plazoCredito: plazoCredito ? parseInt(plazoCredito) : null,

        fechaCotizacion: fechaCotizacion || null,

        fechaEstimadaPago: fechaEstimadaPago || null,

        diasRestantes: diasRestantes ?? null,

        unitBusiness,
        concepto,
        equipo: equipo || null,

        // IMPORTANTE:
        // cantidad, precioUnitario y fechaOperacion NO se actualizan en edición.

        transporte,
        estadoPago,
        observaciones,
        clientId,
    });

    return res.status(200).json({
        message: "Venta actualizada correctamente",
        sale,
    });
}

            if (method === 'DELETE') {
                if (role !== 'admin' && role !== 'gerencia') {
                    return res.status(403).json({
                        message: "Solo administradores o gerencia pueden eliminar ventas",
                    });
                }

                await sale.destroy();

                return res.status(200).json({
                    message: "Venta eliminada correctamente",
                });
            }

            res.setHeader('Allow', ['PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);

        } catch (error) {
            console.error("ERROR EN API DINÁMICA SALES:", error);

            return res.status(500).json({
                message: "Error interno",
                error: error.message,
            });
        }
    });
}