const carritoModelo = require('../Modelo/carritoModelo');

// Añadir item al carrito (insertar o actualizar cantidad)
async function addItem(req, res) {
    const { usuario_id, producto_id, cantidad, nombre_imagen } = req.body;
    if (!usuario_id || !producto_id || !cantidad) {
        return res.status(400).json({ success: false, message: 'usuario_id, producto_id y cantidad son requeridos' });
    }
    try {
        // Sanitizar nombre de imagen si se envía (podría ser una URL completa)
        const safeNombreImagen = nombre_imagen ? (String(nombre_imagen).split('/').pop().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')) : null;
        const result = await carritoModelo.addItem(usuario_id, producto_id, cantidad, safeNombreImagen);
        if (result.updated) {
            return res.json({ success: true, action: 'updated', affectedRows: result.updated, id: result.id });
        } else {
            return res.json({ success: true, action: 'inserted', id: result.insertId });
        }
    } catch (error) {
        console.error('Error en carrito.addItem:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Obtener items del carrito por usuario (con detalles del producto)
async function getItemsByUser(req, res) {
    const usuarioId = req.params.usuario_id;
    if (!usuarioId) {
        return res.status(400).json({ success: false, message: 'usuario_id es requerido' });
    }
    try {
        const rows = await carritoModelo.getItemsByUser(usuarioId);
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error en carrito.getItemsByUser:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Actualizar cantidad de item del carrito por id (carrito.id)
async function updateItem(req, res) {
    const carritoId = req.params.id;
    const { cantidad, nombre_imagen } = req.body;
    if (!carritoId || cantidad === undefined) {
        return res.status(400).json({ success: false, message: 'id y cantidad son requeridos' });
    }
    try {
        // Sanitizar nombre de imagen si se envía
        const safeNombreImagen = nombre_imagen ? (String(nombre_imagen).split('/').pop().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')) : null;
        const affectedRows = await carritoModelo.updateItem(carritoId, cantidad, safeNombreImagen);
        if (affectedRows === 0) return res.status(404).json({ success: false, message: 'Item no encontrado' });
        return res.json({ success: true, updated: affectedRows });
    } catch (error) {
        console.error('Error en carrito.updateItem:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Eliminar item del carrito por id
async function deleteItem(req, res) {
    const carritoId = req.params.id;
    if (!carritoId) {
        return res.status(400).json({ success: false, message: 'id es requerido' });
    }
    try {
        const affectedRows = await carritoModelo.deleteItem(carritoId);
        if (affectedRows === 0) return res.status(404).json({ success: false, message: 'Item no encontrado' });
        return res.json({ success: true, deleted: affectedRows });
    } catch (error) {
        console.error('Error en carrito.deleteItem:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Vaciar carrito completo por usuario
async function vaciarCarrito(req, res) {
    const { usuario_id } = req.params;

    if (!usuario_id) {
        return res.status(400).json({ success: false, message: 'usuario_id es requerido' });
    }

    try {
        const [result] = await pool.query(
            'DELETE FROM carrito WHERE usuario_id = ?',
            [usuario_id]
        );

        return res.json({
            success: true,
            message: 'Carrito vaciado correctamente',
            deleted: result.affectedRows
        });

    } catch (err) {
        console.error('Error al vaciar carrito:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
}


module.exports = {
    addItem,
    getItemsByUser,
    updateItem,
    deleteItem,
    vaciarCarrito
};
