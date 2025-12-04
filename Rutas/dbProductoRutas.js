const express = require('express');
const router = express.Router();
const verificarToken = require("../Middleware/verificarToken");
const verificarAdmin = require("../Middleware/verificarAdmin");

const {
    getProductos,
    getProductosById,
    getProductosByGenero,
    createProducto,
    updateProducto,
    updateOferta,
    deleteProducto //No se para que se usaria pero x
} = require('../Controladores/dbProductoController');

router.get('/', getProductos);
router.get('/genero/:genero', getProductosByGenero);
router.get('/:id', getProductosById);
router.post('/createProducto', verificarToken, verificarAdmin, createProducto); //Tiene que estar protegida
router.put('/oferta/:id', verificarToken, verificarAdmin, updateOferta);//Tiene que estar protegida
router.put('/:id', verificarToken, verificarAdmin, updateProducto);//Tiene que estar protegida
router.delete('/:id', verificarToken, verificarAdmin, deleteProducto);//Tiene que estar protegida

module.exports = router;