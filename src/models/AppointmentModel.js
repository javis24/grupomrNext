import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';
import Clients from './ClientModel.js';

const { DataTypes } = Sequelize;

const Appointments = db.define('appointments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: { type: DataTypes.DATE, allowNull: false },
    clientName: { type: DataTypes.STRING, allowNull: false },
    clientStatus: { type: DataTypes.STRING, allowNull: false },
    assignedTo: { type: DataTypes.INTEGER, allowNull: true },
    appointmentTime: { type: DataTypes.STRING, allowNull: false },
    comments: { type: DataTypes.TEXT, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
    freezeTableName: true,
    timestamps: true 
});

Appointments.belongsTo(Users, { foreignKey: 'userId' }); 
Appointments.belongsTo(Users, { foreignKey: 'assignedTo', as: 'assignedUser' });
Appointments.belongsTo(Clients, {
  foreignKey: 'clientName', 
  targetKey: 'fullName',    
  as: 'datosCliente'       
});

export default Appointments;