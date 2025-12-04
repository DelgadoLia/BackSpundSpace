const db = require('../DB/conexion');

class chatModelo {

    // GUARDAR MENSAJE
    static async guardarMensaje(idUsuario, mensaje, respuesta) {
        const sql = `
            INSERT INTO mensajes (idUsuario, mensaje, respuesta, fechaMensaje, fechaRespuesta)
            VALUES (?, ?, ?, NOW(), NOW())
        `;
        const [result] = await db.query(sql, [idUsuario, mensaje, respuesta]);
        return result.insertId;
    }

    // HISTORIAL DE UN SOLO USUARIO
    static async obtenerHistorial(idUsuario) {
        const sql = `
            SELECT * FROM mensajes 
            WHERE idUsuario = ? 
            ORDER BY fechaMensaje ASC
        `;
        const [results] = await db.query(sql, [idUsuario]);
        return results;
    }

    // NECESARIO PARA ADMIN (este era el que fallaba)
    static async obtenerTodosMensajes() {
        const sql = `
            SELECT m.*, u.nombreUsuario, u.nombreCompleto
            FROM mensajes m
            LEFT JOIN usuarios u ON m.idUsuario = u.id
            ORDER BY fechaMensaje DESC
        `;
        const [results] = await db.query(sql);
        return results;
    }

    // ADMIN RESPONDE MENSAJE
    static async responderMensaje(id, respuesta) {
        const sql = `
            UPDATE mensajes 
            SET respuesta = ?, fechaRespuesta = NOW()
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [respuesta, id]);
        return result.affectedRows;
    }
}

module.exports = chatModelo;