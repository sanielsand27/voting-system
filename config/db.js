const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .promise()
  .query("SELECT 1")
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((err) => {
    console.error("DATABASE ERROR");
    console.error(err);
  });

module.exports = pool.promise();
