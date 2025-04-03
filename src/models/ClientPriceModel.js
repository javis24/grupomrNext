// models/ClientePriceModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";


const { DataTypes } = Sequelize;

const ClientePriceModel = db.define('client_prices', {
        uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    cliente: DataTypes.STRING,
    asesorcomercial: DataTypes.STRING,
    contacto: DataTypes.STRING,
    email: DataTypes.STRING,
    telefono: DataTypes.STRING,
    ubicacion: DataTypes.STRING,
    rfc: DataTypes.STRING,
}, {
    freezeTableName: true
});

export default ClientePriceModel;
