const chatModelo = require("../Modelo/chatModelo");

async function listarTodosMensajes(req, res) {
    try {
        console.log("[chatAdminControlador] listarTodosMensajes (admin):", req.usuario);
        const mensajes = await chatModelo.obtenerTodosMensajes();
        res.json({ success: true, data: mensajes });
    } catch (error) {
        console.error("[chatAdminControlador] Error listarTodosMensajes:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
}

async function responder(req, res) {
    try {
        const { id } = req.params;
        const { respuesta } = req.body;
        console.log("[chatAdminControlador] responder:", { id, respuesta, admin: req.usuario });

        if (!respuesta || respuesta.trim() === '') {
            return res.status(400).json({ mensaje: "Respuesta vacía" });
        }

        const filas = await chatModelo.responderMensaje(id, respuesta);
        if (filas === 0) {
            return res.status(404).json({ mensaje: "Mensaje no encontrado" });
        }
        res.json({ mensaje: "Respuesta guardada" });
    } catch (error) {
        console.error("[chatAdminControlador] Error responder:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
}

module.exports = {
    listarTodosMensajes,
    responder
};
