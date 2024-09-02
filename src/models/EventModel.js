// models/EventModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Clients from "./ClientModel.js";

const { DataTypes } = Sequelize;

const Event = db.define('event', {
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
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true
});

Clients.hasMany(Event);
Event.belongsTo(Clients, { foreignKey: 'clientId' });

export default Event;
