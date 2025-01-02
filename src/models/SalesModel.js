import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const Sales = db.define('Sales', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    month: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sale: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },

}, {
    freezeTableName: true // Mantiene el nombre de la tabla tal cual
});

export default Sales;
