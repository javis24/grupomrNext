import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const Appointments = db.define('appointments', {
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    clientName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientStatus: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'id'
        }
    }
}, {
    freezeTableName: true
});

Users.hasMany(Appointments);
Appointments.belongsTo(Users, { foreignKey: 'userId' });

export default Appointments;
