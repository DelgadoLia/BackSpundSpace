const pool = require("../DB/conexion");

async function crearUsuario(nombreCompleto, nombreUsuario, pais, contrasena, palabra, correo) {
    const sql = `INSERT INTO usuarios (nombreCompleto, nombreUsuario, pais, correo, contrasena, palabra)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
        nombreCompleto,
        nombreUsuario,
        pais,
        correo,
        contrasena,
        palabra
    ]);

    return result.insertId;
}

async function getUsuarioPorNombre(nombreUsuario) {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE nombreUsuario = ?",[nombreUsuario]);
    return rows[0];
}

//Aumentar intento fallido
async function aumentarIntentoFallido(id) {
    await pool.query(
        "UPDATE usuarios SET intentosFallidos = intentosFallidos + 1 WHERE id = ?",
        [id]
    );
}

//Bloquear por 5 minutos
async function bloquearCuenta(id) {
    await pool.query(
        "UPDATE usuarios SET bloqueadoHasta = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?",
        [id]
    );
}

//Reiniciar contador
async function reiniciarIntentos(id) {
    await pool.query(
        "UPDATE usuarios SET intentosFallidos = 0, bloqueadoHasta = NULL WHERE id = ?",
        [id]
    );
}

// usuarioModelo.js - VERSIÓN CORREGIDA
async function updateContrasena(id, nuevaContrasena) {
    const [result] = await pool.query(
        "UPDATE usuarios SET contrasena = ? WHERE id = ?",
        [nuevaContrasena, id]
    );
    return result.affectedRows;
}

module.exports = {
    crearUsuario,
    getUsuarioPorNombre,
    aumentarIntentoFallido,
    bloquearCuenta,
    reiniciarIntentos,
    updateContrasena
};
