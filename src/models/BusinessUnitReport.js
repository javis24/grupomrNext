// models/BusinessUnitReport.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const BusinessUnitReport = db.define('BusinessUnitReports', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]  // El nombre debe tener al menos 3 caracteres
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: true,
      isDecimal: true  // Asegurarse de que sea un número decimal
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW  // Establecer la fecha de creación automáticamente
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  timestamps: false,  // Desactiva las columnas createdAt y updatedAt
  freezeTableName: true  // Evitar que Sequelize pluralice el nombre de la tabla
});

// Establecer relaciones
Users.hasMany(BusinessUnitReport, { foreignKey: 'userId' });
BusinessUnitReport.belongsTo(Users, { foreignKey: 'userId' });

export default BusinessUnitReport;
