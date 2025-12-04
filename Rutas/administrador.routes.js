const express = require('express');
const router = express.Router();

// Middleware correctos
const upload = require('../Middleware/uploadImages');
const verificarToken = require('../Middleware/verificarToken');
const verificarAdmin = require('../Middleware/verificarAdmin');

// Controlador
const ctrl = require('../Controladores/adminController');

// POST crear producto
router.post('/inventario',  upload.single('imageFile'), ctrl.createProducto);

// GET obtener inventario
router.get('/inventario',  ctrl.getInventario);

// GET total ventas
router.get('/totalventas',  ctrl.totalVentas);

// PUT actualizar producto
router.put('/inventario/:id', upload.single('imageFile'), ctrl.updateProducto);

// DELETE eliminar producto
router.delete('/inventario/:id',  ctrl.deleteProducto);


module.exports = router;
