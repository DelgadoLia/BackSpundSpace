// Controladores/tarifas.controller.js
const tarifasModelo = require('../Modelo/tarifasModelo');
const usuarioModelo = require('../Modelo/usuarioModelo');

// Obtener tarifas por país específico
async function obtenerTarifasPorPais(req, res) {
    try {
        const { pais } = req.params;

        if (!pais) {
            return res.status(400).json({ 
                success: false,
                message: 'Falta el parámetro país' 
            });
        }

        const tarifas = await tarifasModelo.getTarifasPorPais(pais);

        if (!tarifas) {
            // Si no existe, usar tarifas por defecto (México)
            const tarifasDefault = await tarifasModelo.getTarifasPorPais('México');
            return res.json({
                success: true,
                data: tarifasDefault || {
                    pais: 'México',
                    impuesto: 16,
                    envio: 15.00
                },
                message: 'País no encontrado, usando tarifas por defecto'
            });
        }

        res.json({
            success: true,
            data: tarifas
        });

    } catch (error) {
        console.error('Error al obtener tarifas por país:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener tarifas' 
        });
    }
}

// Obtener tarifas del usuario autenticado
async function obtenerTarifasUsuario(req, res) {
    try {
        // req.usuario viene del middleware verificarToken
        const usuarioId = req.usuario?.id;
        console.log('📊 [TARIFAS] Obteniendo tarifas para usuario ID:', usuarioId);

        if (!usuarioId) {
            console.warn('⚠️ [TARIFAS] No hay usuario ID en el token');
            return res.status(401).json({ 
                success: false,
                message: 'Usuario no autenticado' 
            });
        }

        // Obtener datos del usuario
        const usuario = await usuarioModelo.getUsuarioPorId(usuarioId);
        console.log('👤 [TARIFAS] Datos del usuario:', usuario);

        if (!usuario) {
            console.warn('⚠️ [TARIFAS] Usuario no encontrado en BD:', usuarioId);
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }

        console.log('🌍 [TARIFAS] País del usuario:', usuario.pais);

        // Obtener tarifas del país del usuario
        const tarifas = await tarifasModelo.getTarifasPorPais(usuario.pais);
        console.log('💰 [TARIFAS] Tarifas encontradas:', tarifas);

        if (!tarifas) {
            // Usar tarifas por defecto si no existe el país
            console.warn(`⚠️ [TARIFAS] No hay tarifas para ${usuario.pais}, usando defaults`);
            return res.json({
                success: true,
                data: {
                    pais: usuario.pais,
                    impuesto: 16,
                    envio: 15.00
                },
                message: 'Tarifas por defecto aplicadas'
            });
        }

        console.log('✅ [TARIFAS] Enviando tarifas:', tarifas);
        res.json({
            success: true,
            data: tarifas
        });

    } catch (error) {
        console.error('❌ [TARIFAS] Error al obtener tarifas del usuario:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener tarifas: ' + error.message
        });
    }
}

// Listar todas las tarifas disponibles
async function listarTodasTarifas(req, res) {
    try {
        const tarifas = await tarifasModelo.getTodasTarifas();

        res.json({
            success: true,
            data: tarifas
        });

    } catch (error) {
        console.error('Error al listar tarifas:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al listar tarifas' 
        });
    }
}

module.exports = {
    obtenerTarifasPorPais,
    obtenerTarifasUsuario,
    listarTodasTarifas
};