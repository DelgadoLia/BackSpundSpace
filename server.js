const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const baseRutas = require('./Rutas/dbProductoRutas');
const adminRutas = require('./Rutas/administrador.routes');
const usuarioRutas = require("./Rutas/usuarioRutas");
const correoRutas = require("./Rutas/correoRutas");
const captchaRutas = require('./Rutas/captchaRutas'); 
const chatRutas = require('./Rutas/chatRutas');
const chatAdminRutas = require('./Rutas/chatAdminRutas');
const carritoRutas = require('./Rutas/carrito.routes');
const cuponesRutas = require("./Rutas/cuponesRutas");
const notaRutas = require('./Rutas/nota.routes');
const pool = require('./DB/conexion');
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Carpeta pública para imágenes del email
app.use("/public", express.static(path.join(__dirname, "public")));

// Carpeta donde subes fotos
const carpeta = path.join(__dirname, "uploads");
app.use("/uploads", express.static(carpeta));

// Servir archivos estáticos del cliente (HTML/CSS/JS) si se desea
const clientDir = path.join(__dirname, '..', 'client');

app.get("/imagenes", (req, res) => {
  try {
    const archivos = fs.readdirSync(carpeta);
    res.json(archivos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al leer carpeta de imágenes" });
  }
});

// Rutas principales
app.get('/', (req, res) => {
  res.send('API funcionando correctamente 🚀');
});

app.use('/api/productos', baseRutas);
app.use('/api/cupones', cuponesRutas);
app.use('/api/admin', adminRutas);
app.use('/api/carrito', carritoRutas);
app.use('/api/nota', notaRutas);
app.use('/api/usuarios', usuarioRutas);
app.use('/api/correo', correoRutas);  
app.use('/api/captcha', captchaRutas);
app.use('/api/chat', chatRutas);
app.use('/api/chat-admin', chatAdminRutas);
// Probar conexión a BD
async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log(' Conexión a BD OK, resultado:', rows[0].result);
  } catch (error) {
    console.error(' Error en conexión BD:', error.message);
  }
}

// Asegurar que la columna `nombre_imagen` exista en la tabla `carrito`
async function ensureCarritoNombreImagenColumn() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM carrito LIKE 'nombre_imagen'");
    if (!cols || cols.length === 0) {
      console.log('Columna nombre_imagen no encontrada en carrito. Añadiendo...');
      await pool.query("ALTER TABLE carrito ADD COLUMN nombre_imagen VARCHAR(255) DEFAULT NULL");
      console.log('Columna nombre_imagen añadida con éxito.');
    } else {
      console.log('Columna nombre_imagen ya existe en carrito.');
    }
  } catch (err) {
    console.error('Error al asegurar la columna nombre_imagen en carrito:', err.message);
  }
}

app.use(express.static(clientDir));

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  testConnection();
  ensureCarritoNombreImagenColumn();
});
