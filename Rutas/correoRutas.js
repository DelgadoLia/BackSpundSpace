const express = require("express");
const router = express.Router();
const verificarToken = require('../Middleware/verificarToken');

// Importa ambos controladores
const { enviarContacto, enviarSuscripcion } = require("../Controladores/correoControlador");

router.post("/contacto", verificarToken, enviarContacto);
router.post("/suscripcion", enviarSuscripcion);

module.exports = router;
