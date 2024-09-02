// models/TrafficLightModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Event from "./EventModel.js";

const { DataTypes } = Sequelize;

const TrafficLight = db.define('traffic_light', {
    uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true
});

Event.hasMany(TrafficLight);
TrafficLight.belongsTo(Event, { foreignKey: 'eventId' });

export default TrafficLight;
