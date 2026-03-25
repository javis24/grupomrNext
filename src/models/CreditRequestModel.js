import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js'; // Importamos el modelo de Usuarios para la relación

const { DataTypes } = Sequelize;

const CreditRequests = db.define('CreditRequests', {
    uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    nombreComercial: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    rfc: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    montoSolicitado: { 
        type: DataTypes.DECIMAL(15, 2), 
        defaultValue: 0 
    },
    status: { 
        type: DataTypes.STRING, 
        defaultValue: 'Pendiente' 
    },
    // IMPORTANTE: Definir como JSON para que Sequelize lo serialice automáticamente
    fullData: { 
        type: DataTypes.JSON, 
        allowNull: false 
    },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true
});

// DEFINICIÓN DE RELACIONES (Igual que en tu modelo de productos)
Users.hasMany(CreditRequests, { foreignKey: 'userId' });
CreditRequests.belongsTo(Users, { foreignKey: 'userId', as: 'asesor' });

// ESTA LÍNEA ES VITAL: Exportar el modelo
export default CreditRequests;