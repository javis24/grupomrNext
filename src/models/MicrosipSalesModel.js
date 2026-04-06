import { DataTypes } from 'sequelize';
import db from '../config/Database.js';

const MicrosipSales = sequelize.define('MicrosipSales', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: { type: DataTypes.DATEONLY },
    folio: { type: DataTypes.STRING },
    cliente: { type: DataTypes.STRING },
    claveArticulo: { type: DataTypes.STRING },
    articulo: { type: DataTypes.STRING },
    unidades: { type: DataTypes.DECIMAL(10, 2) },
    precioUnitario: { type: DataTypes.DECIMAL(10, 2) },
    montoNeto: { type: DataTypes.DECIMAL(10, 2) },
    vendedor: { type: DataTypes.STRING },
    userId: { type: DataTypes.INTEGER } // ID del asesor que sube el archivo
}, { timestamps: true });

export default MicrosipSales;

