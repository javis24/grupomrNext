import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const Incidents = db.define('Incidents', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [3, 255] }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // NUEVOS CAMPOS
    incidentDate: {
      type: DataTypes.DATEONLY, // Solo fecha sin hora
      allowNull: false
    },
    entityName: {
      type: DataTypes.STRING, // Cliente o Proveedor
      allowNull: false
    },
    correctivePlan: {
      type: DataTypes.TEXT, // Plan de acción correctivo
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ''
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    timestamps: true // Habilitado para tener control de fechas de creación
  });

Users.hasMany(Incidents, { foreignKey: 'userId' });
Incidents.belongsTo(Users, { foreignKey: 'userId' });

export default Incidents;