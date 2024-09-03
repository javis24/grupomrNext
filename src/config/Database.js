import { Sequelize } from 'sequelize';

const db = new Sequelize('u684594548_gmr_auth', 'u684594548_gmr_authJavis', 'LuisJaviers28k', {
    host: '82.180.138.103', 
    dialect: 'mysql',
    logging: console.log, 
});

export default db;
