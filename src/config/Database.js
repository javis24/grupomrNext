import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2'; // Importación limpia para ES Modules

const sequelizeClient = () => {
    return new Sequelize(
        process.env.MYSQL_DATABASE, 
        process.env.MYSQL_USER, 
        process.env.MYSQL_PASSWORD, 
        {
            host: process.env.MYSQL_HOST,
            dialect: 'mysql',
            dialectModule: mysql2, // Usamos la referencia importada
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
};

// Verificar si ya existe una instancia en el objeto global
const globalForSequelize = global;
const db = globalForSequelize.sequelize || sequelizeClient();

// En desarrollo, guardamos la instancia globalmente
if (process.env.NODE_ENV !== 'production') {
    globalForSequelize.sequelize = db;
}

export default db;