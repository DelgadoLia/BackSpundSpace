const svgCaptcha = require("svg-captcha");

let captchas = {};  // Guardamos captcha por sesión temporal

function generarCaptcha(req, res) {
    const captcha = svgCaptcha.create({
        size: 5,
        noise: 3,
        color: true,
        background: '#f0f0f0'
    });

    const id = Date.now().toString();  
    const expires = Date.now() + 2 * 60 * 1000; // 2 minutos

    captchas[id] = {
        text: captcha.text.toLowerCase(),
        expires
    };

    // Eliminación automática después de 2 min
    setTimeout(() => delete captchas[id], 2 * 60 * 1000);

    res.json({
        id,
        image: captcha.data
    });
}

function validarCaptcha(req, res) {
    const { id, respuesta } = req.body;

    if (!captchas[id]) {
        return res.status(400).json({ mensaje: "CAPTCHA expirado o no válido" });
    }

    const captcha = captchas[id];

    if (Date.now() > captcha.expires) {
        delete captchas[id];
        return res.status(400).json({ mensaje: "CAPTCHA expirado" });
    }

    if (captcha.text !== respuesta.toLowerCase()) {
        return res.status(400).json({ mensaje: "CAPTCHA incorrecto" });
    }

    // CAPTCHA válido
    delete captchas[id];
    res.json({ mensaje: "CAPTCHA válido" });
}

module.exports = {
    generarCaptcha,
    validarCaptcha
};