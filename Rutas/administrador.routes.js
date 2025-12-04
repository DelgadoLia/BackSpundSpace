const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const administradorController = require('../Controladores/administrador.controller');
const verificarToken = require('../Middleware/verificarToken');
const verificarAdmin = require('../Middleware/verificarAdmin');

// Configure multer to store files in server/uploads
// We will save files using the original filename (sanitized) so
// the DB and uploads reflect only the original name (no prefixes)

// Directorio donde se guardarán las imágenes
const uploadsDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadsDir),
	filename: (req, file, cb) => {
		// Sanitize the original filename: remove problematic characters and spaces
		// Use path.basename for extra safety against directory traversal
		const original = path.basename(file.originalname);
		const safe = original.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
		cb(null, safe);
	}
});
const upload = multer({ storage });

// --- Rutas del Administrador ---

// POST /api/admin/inventario - Crear nuevo producto con subida de imagen
router.post('/inventario', verificarToken, verificarAdmin, upload.single('imageFile'), administradorController.createProducto);

// GET /api/admin/inventario - Obtener lista de todos los productos
router.get('/inventario', verificarToken, verificarAdmin, administradorController.getAllProductos);

// GET /api/admin/totalventas - Obtener la suma monetaria total de ventas
router.get('/totalventas', verificarToken, verificarAdmin, administradorController.getTotalVentas);

// PUT /api/admin/inventario/:id - Actualizar un producto (soporta nueva imagen)
router.put('/inventario/:id', verificarToken, verificarAdmin, upload.single('imageFile'), administradorController.updateProducto);

// DELETE /api/admin/inventario/:id - Eliminar un producto
router.delete('/inventario/:id', verificarToken, verificarAdmin, administradorController.deleteProducto);

module.exports = router;
