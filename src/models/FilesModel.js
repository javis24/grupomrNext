// models/File.js
import { Sequelize } from "sequelize";
import db from "../config/Database";
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const File = db.define('files', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
}, {
  timestamps: false, 
  freezeTableName: true,
});

// Relación entre Users y Files
Users.hasMany(File, { foreignKey: 'userId' });
File.belongsTo(Users, { foreignKey: 'userId' });

export default File;
