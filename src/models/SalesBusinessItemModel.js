import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import SalesBusiness from "./SalesBusinessModel.js";

const { DataTypes } = Sequelize;

const SalesBusinessItem = db.define("salesbusiness_items", {
    saleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    productCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unitMeasure: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
}, {
    freezeTableName: true,
});

SalesBusiness.hasMany(SalesBusinessItem, {
    foreignKey: "saleId",
    as: "items",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

SalesBusinessItem.belongsTo(SalesBusiness, {
    foreignKey: "saleId",
    as: "sale",
});

export default SalesBusinessItem;