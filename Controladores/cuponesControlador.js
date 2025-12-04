const cuponModelo = require("../Modelo/cuponModelo");

// CREAR CUPÓN
exports.crearCupon = async (req, res) => {
    const { codigo, descuento, expiracion, usos_maximos } = req.body;

    if (!codigo || !descuento || !expiracion) {
        return res.status(400).json({ message: "Faltan datos obligatorios ❌" });
    }

    try {
        const nuevo = await cuponModelo.crearCupon(codigo, descuento, expiracion, usos_maximos);
        res.json({ message: "Cupón creado ✔", cupon: nuevo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear cupón ❌" });
    }
};

// OBTENER TODOS LOS CUPONES
exports.obtenerCupones = async (req, res) => {
    try {
        const cupones = await cuponModelo.obtenerCupones();
        res.json(cupones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener cupones ❌" });
    }
};

// VALIDAR CUPÓN
exports.validarCupon = async (req, res) => {
    const { codigo } = req.body;

    if (!codigo) {
        return res.status(400).json({ message: "Debes enviar un código ❌" });
    }

    try {
        const cupon = await cuponModelo.buscarCupon(codigo);

        if (!cupon) {
            return res.status(404).json({ message: "Cupón no encontrado ❌" });
        }

        const hoy = new Date();
        const expira = new Date(cupon.expiracion);

        if (hoy > expira) {
            return res.status(400).json({ message: "Cupón expirado ❌" });
        }

        if (cupon.usos_actuales >= cupon.usos_maximos) {
            return res.status(400).json({ message: "Cupón sin usos disponibles ❌" });
        }

        // Si es válido
        res.json({
            message: "Cupón válido ✔",
            cupon: {
                id: cupon.id,
                codigo: cupon.codigo,
                descuento: cupon.descuento
            }
        });

        // Aumentar contador
        await cuponModelo.sumarUso(cupon.id);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al validar cupón ❌" });
    }
};

// ELIMINAR CUPÓN
exports.eliminarCupon = async (req, res) => {
    const { id } = req.params;

    try {
        const eliminado = await cuponModelo.eliminarCupon(id);

        if (!eliminado) {
            return res.status(404).json({ message: "Cupón no encontrado ❌" });
        }

        res.json({ message: "Cupón eliminado ✔" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar cupón ❌" });
    }
};
