// Modelo/tarifasModelo.js
const pool = require('../DB/conexion');

// Obtener tarifas por país
async function getTarifasPorPais(pais) {
    try {
        console.log('🔍 [MODELO] Buscando tarifas para país:', pais);
        
        if (!pais) {
            console.warn('⚠️ [MODELO] País vacío');
            return null;
        }

        const [rows] = await pool.query(
            'SELECT * FROM tarifas_envio_impuestos WHERE pais = ?',
            [pais]
        );
        
        console.log('📦 [MODELO] Resultado de query:', rows);
        
        if (rows && rows.length > 0) {
            console.log('✅ [MODELO] Tarifa encontrada:', rows[0]);
            return rows[0];
        } else {
            console.warn('⚠️ [MODELO] No se encontraron tarifas para:', pais);
            return null;
        }
    } catch (error) {
        console.error('❌ [MODELO] Error en getTarifasPorPais:', error);
        throw error;
    }
}

// Obtener todas las tarifas
async function getTodasTarifas() {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM tarifas_envio_impuestos ORDER BY pais ASC'
        );
        return rows;
    } catch (error) {
        console.error('Error en getTodasTarifas:', error);
        throw error;
    }
}

// Crear o actualizar tarifa de un país
async function upsertTarifa(pais, impuesto, envio) {
    try {
        const [result] = await pool.query(
            `INSERT INTO tarifas_envio_impuestos (pais, impuesto, envio) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             impuesto = VALUES(impuesto), 
             envio = VALUES(envio)`,
            [pais, impuesto, envio]
        );
        return result;
    } catch (error) {
        console.error('Error en upsertTarifa:', error);
        throw error;
    }
}

module.exports = {
    getTarifasPorPais,
    getTodasTarifas,
    upsertTarifa
};