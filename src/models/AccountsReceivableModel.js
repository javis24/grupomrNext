import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";
import Clients from "./ClientModel.js";

const { DataTypes } = Sequelize;

const AccountsReceivable = db.define('AccountsReceivable', {
    clienteId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    clienteNombre: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    folio: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    fechaFactura: { 
        type: DataTypes.DATEONLY, 
        allowNull: true,
        // Eliminamos validate.isDate si causa problemas con strings vacíos, 
        // o lo dejamos si siempre enviarás la fecha de hoy.
    },
    fechaVencimiento: { 
        type: DataTypes.DATEONLY, 
        allowNull: false,
        validate: {
            notEmpty: true,
            isDate: true
        }
    },
    saldo: { 
        type: DataTypes.DECIMAL(12, 2), 
        allowNull: false, // Cambiado de defaultValue a allowNull false para obligar el dato
        validate: {
            notEmpty: true,
            isDecimal: true
        }
    },
    diasAtraso: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0 
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

// Asociaciones
Users.hasMany(AccountsReceivable, { foreignKey: 'userId' });
AccountsReceivable.belongsTo(Users, { foreignKey: 'userId' });

Clients.hasMany(AccountsReceivable, { foreignKey: 'clienteId' });
AccountsReceivable.belongsTo(Clients, { foreignKey: 'clienteId' });

export default AccountsReceivable;