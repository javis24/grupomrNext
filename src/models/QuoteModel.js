import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const Quotes = db.define('Quotes', {
    quoteNumber: { type: DataTypes.INTEGER, allowNull: false },
    companyName: { type: DataTypes.STRING, allowNull: false },
    attentionTo: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'Pendiente' },
    userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
    freezeTableName: true
});

Quotes.belongsTo(Users, { foreignKey: 'userId', as: 'assignedUser' });

export default Quotes;