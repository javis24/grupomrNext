// models/IncidentModel.js
import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js'; // Asumo que ya tienes un UserModel

const { DataTypes } = Sequelize;

const Incidents = db.define('Incidents', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255]  // El título debe tener entre 3 y 255 caracteres
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },    
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });
  

// Relación con el modelo de usuario
Users.hasMany(Incidents, { foreignKey: 'userId' });
Incidents.belongsTo(Users, { foreignKey: 'userId' });

export default Incidents;
