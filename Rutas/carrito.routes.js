const express = require('express');
const router = express.Router();
const carritoController = require('../Controladores/carrito.controller');
const verificarToken = require('../Middleware/verificarToken');

// Añadir o actualizar item en carrito
router.post('/add', verificarToken, carritoController.addItem);

// Obtener items del carrito por usuario
router.get('/:usuario_id', verificarToken, carritoController.getItemsByUser);

// Actualizar cantidad
router.put('/:id', verificarToken, carritoController.updateItem);

// Eliminar item
router.delete('/:id', verificarToken, carritoController.deleteItem);

module.exports = router;
