import { Sequelize } from 'sequelize';

const db = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    dialectModule: require('mysql2'),  
    logging: console.log,
});

export default db;
