const fs = require("fs");
const path = require("path");
const { createTransporter } = require('../config/email');

console.log("=== CORREO CONTROLADOR CARGADO (RESEND) ===");

// CARGAR TEMPLATES E IMÁGENES (igual que antes)
const loadTemplate = () => {
  const templatePath = path.join(__dirname, "../email.html");
  if (!fs.existsSync(templatePath)) {
    console.error("❌ email.html no encontrado");
    return "<h1>Gracias por contactarnos</h1>";
  }
  return fs.readFileSync(templatePath, "utf8");
};

const loadTemplate2 = () => {
  const templatePath = path.join(__dirname, "../email2.html");
  if (!fs.existsSync(templatePath)) {
    console.error("❌ email2.html no encontrado");
    return "<h1>Gracias por suscribirte</h1>";
  }
  return fs.readFileSync(templatePath, "utf8");
};

// ✅ CONTROLADOR — CONTACTO (RESEND)
exports.enviarContacto = async (req, res) => {
  const { nombre, email, telefono, asunto, mensaje } = req.body;

  console.log("Enviando contacto a:", email);

  try {
    const transporter = createTransporter();
    const service = process.env.EMAIL_SERVICE || 'resend';
    
    let html = loadTemplate();
    html = html
      .replace(/{{nombre}}/g, nombre)
      .replace(/{{email}}/g, email)
      .replace(/{{telefono}}/g, telefono || "No proporcionado")
      .replace(/{{asunto}}/g, asunto)
      .replace(/{{mensaje}}/g, mensaje);

    if (service === 'resend') {
      // Resend API
      const from = process.env.EMAIL_FROM || 'SoundSpace <talesturntable@gmail.com>';
      
      const data = await transporter.emails.send({
        from: from,
        to: email,
        subject: "En breve te atenderemos ✅",
        html: html
        // Resend maneja attachments diferente si necesitas
      });
      
      console.log("✅ Email enviado con Resend:", data.id);
    } else {
      // Nodemailer para otros servicios
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'SoundSpace <talesturntable@gmail.com>',
        to: email,
        subject: "En breve te atenderemos ✅",
        html: html
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email enviado:", info.messageId);
    }

    res.json({ message: "Correo enviado correctamente ✅" });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Error enviando correo ❌" });
  }
};

// CONTROLADOR — SUSCRIPCIÓN (RESEND)
exports.enviarSuscripcion = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Correo requerido ❌" });
  }

  console.log("Enviando suscripción a:", email);

  try {
    const transporter = createTransporter();
    const service = process.env.EMAIL_SERVICE || 'resend';
    
    let html = loadTemplate2();

    if (service === 'resend') {
      // Resend API
      const from = process.env.EMAIL_FROM || 'SoundSpace <talesturntable@gmail.com>';
      
      const data = await transporter.emails.send({
        from: from,
        to: email,
        subject: "¡Gracias por suscribirte!",
        html: html
      });
      
      console.log("✅ Suscripción enviada con Resend:", data.id);
    } else {
      // Nodemailer
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'SoundSpace <talesturntable@gmail.com>',
        to: email,
        subject: "¡Gracias por suscribirte!",
        html: html
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Suscripción enviada:", info.messageId);
    }

    res.json({ message: "Correo de suscripción enviado ✅" });

  } catch (error) {
    console.error("❌ Error suscripción:", error.message);
    res.status(500).json({ message: "Error enviando correo de suscripción ❌" });
  }
};