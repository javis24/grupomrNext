import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import ProspectStatusHistory from './ProspectStatusHistory';
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Prospect = db.define('prospect', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  saleProcess: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Nombre de la tabla asociada al modelo User
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
});



Prospect.hasMany(ProspectStatusHistory, { foreignKey: "prospectId", onDelete: "CASCADE", onUpdate: "CASCADE" });
ProspectStatusHistory.belongsTo(Prospect, { foreignKey: "prospectId" })

Users.hasMany(Prospect);
Prospect.belongsTo(Users, { foreignKey: 'userId' });



export default Prospect;