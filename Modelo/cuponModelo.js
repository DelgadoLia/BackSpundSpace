const db = require("../DB/conexion");

class cuponModelo {

    // CREAR CUPÓN
    static async crearCupon(codigo, descuento, expiracion, usos_maximos = 1) {
        const sql = `
            INSERT INTO cupones (codigo, descuento, expiracion, usos_maximos, usos_actuales)
            VALUES (?, ?, ?, ?, 0)
        `;
        const [result] = await db.query(sql, [
            codigo,
            descuento,
            expiracion,
            usos_maximos
        ]);

        return { id: result.insertId, codigo, descuento, expiracion, usos_maximos };
    }

    // LISTA DE CUPONES
    static async obtenerCupones() {
        const [rows] = await db.query("SELECT * FROM cupones ORDER BY id DESC");
        return rows;
    }

    // BUSCAR CUPÓN POR CÓDIGO
    static async buscarCupon(codigo) {
        const sql = "SELECT * FROM cupones WHERE codigo = ?";
        const [rows] = await db.query(sql, [codigo]);
        return rows[0];
    }

    // SUMAR USO
    static async sumarUso(id) {
        const sql = `
            UPDATE cupones 
            SET usos_actuales = usos_actuales + 1
            WHERE id = ?
        `;
        const [res] = await db.query(sql, [id]);
        return res.affectedRows;
    }

    // ELIMINAR CUPÓN
    static async eliminarCupon(id) {
        const sql = "DELETE FROM cupones WHERE id = ?";
        const [res] = await db.query(sql, [id]);
        return res.affectedRows;
    }
}

module.exports = cuponModelo;
