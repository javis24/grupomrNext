// models/MktFileModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database";
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const MktFile = db.define('mktfiles', {
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
  timestamps: true,
  freezeTableName: true,
});

Users.hasMany(MktFile, { foreignKey: 'userId' });
MktFile.belongsTo(Users, { foreignKey: 'userId' });

export default MktFile;
