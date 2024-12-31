import { Sequelize } from "sequelize";
import db from "../config/Database.js";


const { DataTypes } = Sequelize;

const ProspectStatusHistory = db.define('ProspectStatusHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      prospectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'prospect', // Nombre de la tabla asociada al modelo Prospect
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      previousStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      newStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });


export default ProspectStatusHistory;