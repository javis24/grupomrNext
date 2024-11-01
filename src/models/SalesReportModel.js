import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const SalesReport = db.define('SalesReports', {
    clienteProveedorProspecto: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    empresa: {
        type: DataTypes.STRING,
        allowNull: false
    },
    unidadNegocio: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productoServicio: {
        type: DataTypes.STRING,
        allowNull: false
    },
    comentarios: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    extraText: { 
        type: DataTypes.TEXT,
        allowNull: true,
      },
      detalles: { 
        type: DataTypes.TEXT,
        allowNull: true,
      },

}, {
    freezeTableName: true // Mantiene el nombre de la tabla tal cual
});

// Relaciones
Users.hasMany(SalesReport, { foreignKey: 'userId' });
SalesReport.belongsTo(Users, { as: 'User', foreignKey: 'userId' });


export default SalesReport;
