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
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: Users,
          key: 'id',
        }
      },      
      notified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
Appointments.belongsTo(Users, { foreignKey: 'assignedTo', as: 'assignedUser' });


export default Appointments;
