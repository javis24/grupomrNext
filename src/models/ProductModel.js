// models/ProductModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import BusinessUnit from "./BusinessUnitModel.js";

const { DataTypes } = Sequelize;

const Product = db.define('product', {
    uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true
});

BusinessUnit.hasMany(Product);
Product.belongsTo(BusinessUnit, { foreignKey: 'businessUnitId' });

export default Product;
