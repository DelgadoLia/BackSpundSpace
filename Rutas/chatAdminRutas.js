const express = require('express');
const router = express.Router();
const chatAdminControlador = require('../Controladores/chatAdminControlador');
const verificarToken = require("../Middleware/verificarToken");
const verificarAdmin = require('../Middleware/verificarAdmin');

// listar todos los mensajes (admin)
router.get('/todos', verificarToken, verificarAdmin, chatAdminControlador.listarTodosMensajes);

// responder mensaje (admin)
router.put('/responder/:id', verificarToken, verificarAdmin, chatAdminControlador.responder);

module.exports = router;
