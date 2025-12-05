// DB/conexion.js
const mysql = require('mysql2/promise');
require('dotenv').config(); 

// Fuerza SSL sin verificar certificado (para Railway)
const connectionString = process.env.DATABASE_URL + '?ssl={"rejectUnauthorized":false}';
const pool = mysql.createPool(connectionString);

module.exports = pool;