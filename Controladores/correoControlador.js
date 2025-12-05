const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { createTransporter } = require('../config/email'); // NUEVA LÍNEA

// TRANSPORTER CONFIG - MODIFICADO
const transporter = createTransporter(); // NUEVA CONFIGURACIÓN

// CARGA DEL TEMPLATE HTML
const loadTemplate = () => {
    return fs.readFileSync(
        path.join(__dirname, "../email.html"),
        "utf8"
    );
};

// SOLO CARGA LAS 5 IMÁGENES QUE QUIERES
const loadImages = () => {
    const imgDir = path.join(__dirname, "../uploads");

    const selectedImages = [
        "8e76aa009656f1878b593997e12ac82e.png",
        "99382194e9fb526827881d7412918060.png",
        "d3ad6d5706d88328a51ff404a2591a50.png",
        "dd7b59e793dcfe6e47f4cde80d34b0de.png",
        "f72ada15a47117d90a53ac9a45df476e.png"
    ];

    return selectedImages.map((file, index) => ({
        filename: file,
        path: path.join(imgDir, file),
        cid: `img${index}`
    }));
};

// ✅ CONTROLADOR — CONTACTO
exports.enviarContacto = async (req, res) => {
    const { nombre, email, telefono, asunto, mensaje } = req.body;

    console.log("Nuevo mensaje recibido:");
    console.log("Nombre:", nombre);
    console.log("Email:", email);
    console.log("Teléfono:", telefono);
    console.log("Asunto:", asunto);
    console.log("Mensaje:", mensaje);

    try {
        let html = loadTemplate();

        html = html
            .replace(/{{nombre}}/g, nombre)
            .replace(/{{email}}/g, email)
            .replace(/{{telefono}}/g, telefono)
            .replace(/{{asunto}}/g, asunto)
            .replace(/{{mensaje}}/g, mensaje);

        await transporter.sendMail({
            from: process.env.EMAIL_FROM 
                ? `"${process.env.EMAIL_FROM_NAME || 'SoundSpace'}" <${process.env.EMAIL_FROM}>`
                : `"SoundSpace" <${process.env.CORREO_APP}>`,
            to: email,
            subject: "En breve te atenderemos ✅",
            html,
            attachments: loadImages()
        });

        res.json({ message: "Correo enviado correctamente " });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error enviando correo " });
    }
};

// CARGAR TEMPLATE email2.html
const loadTemplate2 = () => {
    return fs.readFileSync(
        path.join(__dirname, "../email2.html"),
        "utf8"
    );
};

// CARGAR SÓLO LAS 3 IMÁGENES DE LA SUSCRIPCIÓN
const loadImages2 = () => {
    const imgDir = path.join(__dirname, "../uploads");
    const selectedImages = [
        "d3ad6d5706d88328a51ff404a2591a50.png",
        "dd7b59e793dcfe6e47f4cde80d34b0de.png",
        "2e07a545492769fc9c4c1763dff59f5e.png"
    ];

    return selectedImages.map((file, index) => ({
        filename: file,
        path: path.join(imgDir, file),
        cid: `img${index}`
    }));
};

// CONTROLADOR — SUSCRIPCIÓN
exports.enviarSuscripcion = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Correo requerido " });
    }

    console.log("🟡 Nueva suscripción:", { email });

    try {
        let html = loadTemplate2();

        await transporter.sendMail({
            from: process.env.EMAIL_FROM 
                ? `"${process.env.EMAIL_FROM_NAME || 'SoundSpace'}" <${process.env.EMAIL_FROM}>`
                : `"SoundSpace" <${process.env.CORREO_APP}>`,
            to: email,
            subject: "¡Gracias por suscribirte!",
            html,
            attachments: loadImages2()
        });

        res.json({ message: "Correo de suscripción enviado " });
    } catch (error) {
        console.error("Error enviando suscripción:", error);
        res.status(500).json({ message: "Error enviando correo " });
    }
};