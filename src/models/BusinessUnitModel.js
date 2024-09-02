// src/models/BusinessUnitModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Company from "./CompanyModel.js";

const { DataTypes } = Sequelize;

const BusinessUnit = db.define('business_unit', {
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
        allowNull: true,        
    },
    total: {
        type: DataTypes.FLOAT, 
        allowNull: true,        
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true
});

Company.hasMany(BusinessUnit);
BusinessUnit.belongsTo(Company, { foreignKey: 'companyId' });

export default BusinessUnit;
