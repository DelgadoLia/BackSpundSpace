// Rutas/tarifas.routes.js
const express = require('express');
const router = express.Router();
const tarifasControlador = require('../Controladores/tarifas.controller');
const verificarToken = require('../Middleware/verificarToken');

// Obtener tarifas por país (requiere autenticación)
router.get('/pais/:pais', verificarToken, tarifasControlador.obtenerTarifasPorPais);

// Obtener tarifas del usuario actual
router.get('/usuario', verificarToken, tarifasControlador.obtenerTarifasUsuario);

// Listar todos los países con tarifas (para admin)
router.get('/lista', verificarToken, tarifasControlador.listarTodasTarifas);

module.exports = router;