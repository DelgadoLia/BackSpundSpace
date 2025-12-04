const express = require('express');
const router = express.Router();
const notaController = require('../Controladores/nota.controller');
const verificarToken = require('../Middleware/verificarToken');

// POST /api/nota/compra - generar PDF y enviar nota de compra
router.post('/compra', verificarToken, notaController.enviarNotaCompra);

module.exports = router;
