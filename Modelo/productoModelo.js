const pool = require('../DB/conexion');

//Obtener productos
async function getAllProductos() {
    const [rows] = await pool.query('SELECT * FROM productos')
    return rows;
}

//Obtener productos por id
async function getProductoById(id) {
    const[rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    return rows[0];
}

//obtener producto por genero
async function getProductoByGenero(genero) {
    const[rows] = await pool.query('SELECT * FROM productos WHERE genero = ?', [genero]);
    return rows;
}

//Crear nuevo Producto
async function createProducto(titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta) {
    const[result] = await pool.query(
        'INSERT INTO productos (titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta]
    );
    return result.insertId;
}

//actualizar disponibilidad y ventas del producto
async function updateDisponibilidadYventas(id, disponibilidad, ventas) {
    const[result] = await pool.query(
        'UPDATE productos SET disponibilidad = ?, ventas = ? WHERE id = ?',
        [disponibilidad, ventas, id]
    );
    return result.affectedRows;
}

//actualizar oferta
async function updateOferta(id, oferta) {
    const[result] = await pool.query(
        'UPDATE productos SET oferta = ? WHERE id = ?',
        [oferta, id]
    );
    return result.affectedRows;
}

async function deleteProducto(id) {
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    return result.affectedRows;    
}

// Actualizar producto (todos los campos)
async function updateProducto(id, titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta) {
    const [result] = await pool.query(
        'UPDATE productos SET titulo = ?, artista = ?, descripcion = ?, precio = ?, disponibilidad = ?, genero = ?, ventas = ?, imagen = ?, oferta = ? WHERE id = ?',
        [titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta, id]
    );
    return result.affectedRows;
}

module.exports = {
    getAllProductos,
    getProductoById,
    createProducto,
    deleteProducto,
    getProductoByGenero,
    updateDisponibilidadYventas,
    updateOferta
    ,
    updateProducto
};