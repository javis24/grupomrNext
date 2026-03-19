import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';
import Clients from './ClientModel.js';

const { DataTypes } = Sequelize;

const SalesBusiness = db.define('SalesBusiness', {
    unitBusiness: { type: DataTypes.STRING, allowNull: false },
    concepto: { type: DataTypes.STRING, allowNull: false },
    equipo: { type: DataTypes.STRING, allowNull: true },
    cantidad: { type: DataTypes.FLOAT, allowNull: false },
    precioUnitario: { type: DataTypes.FLOAT, allowNull: false },
    total: { type: DataTypes.FLOAT },
    transporte: { type: DataTypes.STRING, allowNull: false },
    estadoPago: { type: DataTypes.STRING, allowNull: false },
    fechaOperacion: { type: DataTypes.DATEONLY, allowNull: false },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
    freezeTableName: true
});

// Relaciones
SalesBusiness.belongsTo(Users, { foreignKey: 'userId' });
SalesBusiness.belongsTo(Clients, { foreignKey: 'clientId' });

export default SalesBusiness;