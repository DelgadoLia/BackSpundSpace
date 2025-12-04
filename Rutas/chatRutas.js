const express = require('express');
const router = express.Router();
const chatCtrl = require('../Controladores/chatControlador');
const verificarToken = require('../Middleware/verificarToken');

// Enviar mensaje (usuario logeado)
router.post('/enviar', verificarToken, chatCtrl.enviarMensaje);

// Obtener historial del usuario
router.get('/historial/:id', verificarToken, chatCtrl.historial);

module.exports = router;
