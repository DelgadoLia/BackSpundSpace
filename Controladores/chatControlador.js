const chatModelo = require('../Modelo/chatModelo');

module.exports = {

    async enviarMensaje(req, res) {
        try {
            const idUsuario = req.usuario.id;   // El ID viene del token
            const { mensaje } = req.body;

            if (!mensaje) {
                return res.status(400).json({ mensaje: "Falta el mensaje" });
            }

            await chatModelo.guardarMensaje(idUsuario, mensaje);

            return res.json({ mensaje: "Mensaje enviado" });

        } catch (error) {
            console.log("Error en enviarMensaje:", error);
            res.status(500).json({ mensaje: "Error en el servidor" });
        }
    },

    async historial(req, res) {
        try {
            const idToken = req.usuario.id;       // viene del middleware
            const idConsulta = req.params.id;     // viene de la URL

            if (idToken != idConsulta) {
                return res.status(403).json({ mensaje: "Acceso denegado" });
            }

            const historial = await chatModelo.obtenerHistorial(idToken);
            return res.json(historial);

        } catch (error) {
            console.log("Error en historial:", error);
            res.status(500).json({ mensaje: "Error en el servidor" });
        }
    }
};
