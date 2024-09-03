import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); 

let db;

const getDatabaseConnection = () => {
    if (!db) {
        db = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
            host: process.env.MYSQL_HOST,
            dialect: 'mysql',
            logging: console.log,  // Mantén el logging activado o desactivado según lo necesites
        });
    }
    return db;
};

export default getDatabaseConnection;
