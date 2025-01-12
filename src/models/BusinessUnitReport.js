// models/BusinessUnitReport.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const BusinessUnitReport = db.define('BusinessUnitReports', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fileData: {
    type: DataTypes.STRING,
    allowNull: false, // Asegúrate de que esta configuración está presente
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  freezeTableName: true,
  timestamps: true,
});

// Establecer relaciones
Users.hasMany(BusinessUnitReport, { foreignKey: 'userId' });
BusinessUnitReport.belongsTo(Users, { foreignKey: 'userId' });

export default BusinessUnitReport;
