import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: 3306,
    });
    console.log('Connected to MySQL');
    await connection.end();
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
}

testConnection();
