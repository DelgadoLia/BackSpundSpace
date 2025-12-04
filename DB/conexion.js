const mysql = require('mysql2/promise');
require('dotenv').config(); 

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurada');
}

// Maneja correctamente los parámetros SSL
let connectionString = process.env.DATABASE_URL;

if (!connectionString.includes('ssl=')) {
  // Agrega SSL como objeto JSON
  const sslParam = 'ssl={"rejectUnauthorized":true}';
  connectionString += (connectionString.includes('?') ? '&' : '?') + sslParam;
}

const pool = mysql.createPool(connectionString);

module.exports = pool;