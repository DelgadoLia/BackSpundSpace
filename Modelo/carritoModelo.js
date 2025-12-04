const pool = require('../DB/conexion');

// Obtener todos los items del carrito por usuario_id (con detalles del producto)
async function getItemsByUser(usuario_id) {
    const [rows] = await pool.query(`
        SELECT c.id as carrito_id, c.usuario_id, c.producto_id, c.cantidad, c.nombre_imagen,
               p.titulo, p.precio, p.imagen, p.artista, p.oferta, p.disponibilidad
        FROM carrito c
        JOIN productos p ON c.producto_id = p.id
        WHERE c.usuario_id = ?
    `, [usuario_id]);
    return rows;
}

// Obtener un item específico del carrito por id
async function getItemById(carrito_id) {
    const [rows] = await pool.query('SELECT * FROM carrito WHERE id = ?', [carrito_id]);
    return rows[0];
}

// Verificar si un producto ya existe en el carrito del usuario
async function checkItemExists(usuario_id, producto_id) {
    const [rows] = await pool.query('SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?', [usuario_id, producto_id]);
    return rows[0];
}

// Añadir o actualizar item en el carrito
async function addItem(usuario_id, producto_id, cantidad, nombre_imagen) {
    try {
        // Buscar si ya existe
        const existingItem = await checkItemExists(usuario_id, producto_id);
        
        if (existingItem) {
            // Actualizar cantidad
            const [result] = await pool.query(
                nombre_imagen 
                    ? 'UPDATE carrito SET cantidad = cantidad + ?, nombre_imagen = ? WHERE usuario_id = ? AND producto_id = ?'
                    : 'UPDATE carrito SET cantidad = cantidad + ? WHERE usuario_id = ? AND producto_id = ?',
                nombre_imagen 
                    ? [Number(cantidad), nombre_imagen, usuario_id, producto_id]
                    : [Number(cantidad), usuario_id, producto_id]
            );
            return { updated: result.affectedRows, id: existingItem.id };
        } else {
            // Insertar nuevo item
            const [result] = await pool.query(
                'INSERT INTO carrito (usuario_id, producto_id, cantidad, nombre_imagen) VALUES (?, ?, ?, ?)',
                [usuario_id, producto_id, Number(cantidad), nombre_imagen || null]
            );
            return { insertId: result.insertId };
        }
    } catch (error) {
        throw error;
    }
}

// Actualizar cantidad y/o nombre_imagen de un item
async function updateItem(carrito_id, cantidad, nombre_imagen) {
    const [result] = await pool.query(
        nombre_imagen
            ? 'UPDATE carrito SET cantidad = ?, nombre_imagen = ? WHERE id = ?'
            : 'UPDATE carrito SET cantidad = ? WHERE id = ?',
        nombre_imagen
            ? [Number(cantidad), nombre_imagen, carrito_id]
            : [Number(cantidad), carrito_id]
    );
    return result.affectedRows;
}

// Eliminar un item del carrito
async function deleteItem(carrito_id) {
    const [result] = await pool.query('DELETE FROM carrito WHERE id = ?', [carrito_id]);
    return result.affectedRows;
}

// Eliminar todos los items del carrito de un usuario
async function clearUserCart(usuario_id) {
    const [result] = await pool.query('DELETE FROM carrito WHERE usuario_id = ?', [usuario_id]);
    return result.affectedRows;
}

module.exports = {
    getItemsByUser,
    getItemById,
    checkItemExists,
    addItem,
    updateItem,
    deleteItem,
    clearUserCart
};
