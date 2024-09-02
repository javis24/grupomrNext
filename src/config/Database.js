import { Sequelize } from 'sequelize';

const db = new Sequelize('gmr_auth', 'gmr_authJavis', 'Sfdk#2011', {
    host: 'localhost',
    dialect: 'mysql'
});

export default db;