// DB/conexion.js
const mysql = require('mysql2/promise');
require('dotenv').config(); 

// Fuerza SSL sin verificar certificado (para Railway)
const connectionString = process.env.DATABASE_URL + '?ssl={"rejectUnauthorized":false}';
const pool = mysql.createPool(connectionString);

module.exports = pool;

//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