const bcrypt = require("bcryptjs");
const usuarioModelo = require("../Modelo/usuarioModelo");
const jwt = require("jsonwebtoken");

async function registrarUsuario(req, res) {
    try {
        const { nombreCompleto, nombreUsuario, pais, contrasena, palabra, correo} = req.body;

        if (!nombreCompleto || !nombreUsuario || !pais || !contrasena || !palabra || !correo) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        }

        const existe = await usuarioModelo.getUsuarioPorNombre(nombreUsuario);

        if (existe) {
            return res.status(409).json({ mensaje: "El nombre de usuario ya existe" });
        }

        const contra = await bcrypt.hash(contrasena, 10);

        const nuevoId = await usuarioModelo.crearUsuario(
            nombreCompleto,
            nombreUsuario,
            pais,
            contra,
            palabra,
            correo
        );

        res.status(201).json({
            mensaje: "Usuario registrado correctamente",
            usuarioId: nuevoId
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
}


async function loginUsuario(req, res) {
    try {
        const { nombreUsuario, contrasena } = req.body;

        if (!nombreUsuario || !contrasena) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        }

        const usuario = await usuarioModelo.getUsuarioPorNombre(nombreUsuario);

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // si esta bloqueado
        if (usuario.bloqueadoHasta && new Date(usuario.bloqueadoHasta) > new Date()) {
            return res.status(403).json({
                mensaje: "Cuenta bloqueada temporalmente. Intenta más tarde."
            });
        }

        //Validar contraseña
        const valida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!valida) {
            await usuarioModelo.aumentarIntentoFallido(usuario.id);

            // Si llega a 3,  bloquear por 5 minutos
            if (usuario.intentosFallidos + 1 >= 3) {
                await usuarioModelo.bloquearCuenta(usuario.id);
                return res.status(403).json({
                    mensaje: "Demasiados intentos fallidos. Cuenta bloqueada 5 minutos."
                });
            }

            return res.status(401).json({ mensaje: "Contraseña incorrecta" });
        }

        //Si la contraseña es correcta, reset intentos
        await usuarioModelo.reiniciarIntentos(usuario.id);

        //Crear token
        const token = jwt.sign(
            {
                id: usuario.id,
                nombreCompleto: usuario.nombreCompleto,
                nombreUsuario: usuario.nombreUsuario,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
        );

        console.log(`[LOGIN] Usuario "${usuario.nombreUsuario}" inició sesión. Token: ${token}`);

        return res.json({
            mensaje: "Login correcto",
            token,
            id: usuario.id,
            nombreUsuario: usuario.nombreUsuario,
            nombreCompleto: usuario.nombreCompleto,
            rol: usuario.rol
        });

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ mensaje: "Error en servidor" });
    }
}

const updateProducto = async(req, res) => {
    try{
        const {id} = req.params;
        const {disponibilidad, ventas} = req.body;
        const filas = await productoModelo.updateDisponibilidadYventas(id, disponibilidad, ventas);
        if(filas === 0)
            return res.status(404).json({mensaje: 'Producto no encontrado'});
        res.json({mensaje: 'Producto actualizado correctamente'});
    }catch(error){
        console.error('Error al actualizar el producto: ', error);
        res.status(500).json({mensaje: 'Error al actualizar el producto'});
    }
};

async function recuperarContrasena(req, res) {
    try {
        const { nombreUsuario, respuestaSeguridad, nuevaContrasena } = req.body;

        if (!nombreUsuario || !respuestaSeguridad || !nuevaContrasena) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        }

        const usuario = await usuarioModelo.getUsuarioPorNombre(nombreUsuario);

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Verificar respuesta de seguridad
        if (usuario.palabra !== respuestaSeguridad) {
            return res.status(400).json({ mensaje: "Respuesta de seguridad incorrecta" });
        }

        // Encriptar nueva contraseña
        const contra = await bcrypt.hash(nuevaContrasena, 10);

        // Actualizar contraseña
        const filas = await usuarioModelo.updateContrasena(usuario.id, contra);
        
        if (filas === 0)
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        res.json({ mensaje: 'Contraseña restablecida correctamente' });

    } catch (error) {
        console.error('Error al recuperar contraseña:', error);
        res.status(500).json({ mensaje: 'Error al recuperar contraseña' });
    }
}

async function logoutUsuario(req, res) {
    try {
        console.log(`[LOGOUT] Usuario cerró sesión:`, req.usuario);

        return res.json({ mensaje: "Logout exitoso" });

    } catch (error) {
        console.error("[LOGOUT] Error:", error);
        res.status(500).json({ mensaje: "Error en logout" });
    }
}

module.exports = {
    registrarUsuario,
    loginUsuario,
    logoutUsuario,
    recuperarContrasena
};
