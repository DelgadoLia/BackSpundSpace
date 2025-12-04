function verificarAdmin(req, res, next) {
    if (req.usuario.rol !== "admin") {
        return res.status(403).json({ mensaje: "No autorizado (solo admin)" });
    }
    next();
}

module.exports = verificarAdmin;