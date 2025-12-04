const express = require("express");
const router = express.Router();
const usuarioControlador = require("../Controladores/usuarioControlador");
const verificarToken = require("../Middleware/verificarToken");

// Registro - público
router.post("/registrar", usuarioControlador.registrarUsuario);

// Login - público (con captcha dentro del controlador)
router.post("/login", usuarioControlador.loginUsuario);

// Recuperar contraseña - público
router.post("/recuperar", usuarioControlador.recuperarContrasena);

// Logout - requiere token
router.post("/logout", verificarToken, usuarioControlador.logoutUsuario);

module.exports = router;
