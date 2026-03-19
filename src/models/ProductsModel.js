import { Sequelize } from 'sequelize';
import db from '../config/Database.js';
import Users from './UserModel.js';

const { DataTypes } = Sequelize;

const Products = db.define('Products', {
    uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    unitMeasure: { type: DataTypes.STRING, allowNull: false },
    leadTime: { type: DataTypes.STRING },
    cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
    freezeTableName: true
});

Products.belongsTo(Users, { foreignKey: 'userId' });

export default Products;