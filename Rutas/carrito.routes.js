const express = require('express');
const router = express.Router();
const carritoController = require('../Controladores/carrito.controller');
const verificarToken = require('../Middleware/verificarToken');

// Añadir o actualizar item en carrito
router.post('/add',  carritoController.addItem);

// Obtener items del carrito por usuario
router.get('/:usuario_id',  carritoController.getItemsByUser);

// Actualizar cantidad
router.put('/:id', carritoController.updateItem);

// Eliminar item
router.delete('/:id', carritoController.deleteItem);

module.exports = router;
