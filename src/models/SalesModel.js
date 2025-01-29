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
    previousSale: {
        type: DataTypes.FLOAT,
        allowNull: true,      
        defaultValue: 0       
      },
    
      unitName: {
        type: DataTypes.STRING,
        allowNull: true,     
      }

}, {
    freezeTableName: true 
});

export default Sales;
