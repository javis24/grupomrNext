import { DataTypes } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  direction: {
    type: DataTypes.ENUM('incoming', 'outgoing'),
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Asegúrate de que siempre esté asociado a un usuario
  },
});

// Relación User -> Message
Users.hasMany(Message);
Message.belongsTo(Users, { foreignKey: 'userId' });

export default Message;
