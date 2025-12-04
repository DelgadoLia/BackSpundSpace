const express = require('express');
const router = express.Router();
const { generarCaptcha, validarCaptcha } = require('../Controladores/captchaControlador');

router.get('/generar', generarCaptcha);   // FRONT lo llama para mostrar el captcha
router.post('/validar', validarCaptcha);  // BACK lo valida antes del login

module.exports = router;