import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,   
  process.env.MYSQLUSER,       
  process.env.MYSQLPASSWORD,   
  {
    host: process.env.MYSQLHOST, 
    dialect: 'mysql',
  }
);

export default sequelize;
