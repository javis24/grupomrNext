import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const Quotation = db.define('quotations', {
  empresa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  domicilio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  atencionA: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  movil: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departamento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correoElectronico: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  supervisorAsignado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  comentarios: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  freezeTableName: true,
});

Users.hasMany(Quotation);
Quotation.belongsTo(Users, { foreignKey: 'userId' });

export default Quotation;
