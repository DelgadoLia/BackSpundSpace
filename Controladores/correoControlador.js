const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { createTransporter } = require('../config/email');

console.log("=== CORREO CONTROLADOR CARGADO ===");
console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "No definido");
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ Existe" : "❌ No existe");

// TRANSPORTER CONFIG - MODIFICADO
let transporter;
try {
  transporter = createTransporter();
  console.log("✅ Transporter creado exitosamente");
} catch (error) {
  console.error("❌ Error creando transporter:", error.message);
  transporter = null;
}

// CARGA DEL TEMPLATE HTML
const loadTemplate = () => {
  const templatePath = path.join(__dirname, "../email.html");
  console.log("Buscando template en:", templatePath);
  
  if (!fs.existsSync(templatePath)) {
    console.error("❌ Archivo email.html NO encontrado en:", templatePath);
    return "<h1>Template no encontrado</h1>";
  }
  
  console.log("✅ Template encontrado");
  return fs.readFileSync(templatePath, "utf8");
};

// SOLO CARGA LAS 5 IMÁGENES QUE QUIERES
const loadImages = () => {
  const imgDir = path.join(__dirname, "../uploads");
  console.log("Buscando imágenes en:", imgDir);

  if (!fs.existsSync(imgDir)) {
    console.error("❌ Carpeta uploads NO encontrada");
    return [];
  }

  const selectedImages = [
    "8e76aa009656f1878b593997e12ac82e.png",
    "99382194e9fb526827881d7412918060.png",
    "d3ad6d5706d88328a51ff404a2591a50.png",
    "dd7b59e793dcfe6e47f4cde80d34b0de.png",
    "f72ada15a47117d90a53ac9a45df476e.png"
  ];

  const attachments = selectedImages.map((file, index) => {
    const filePath = path.join(imgDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}: ${exists ? 'Encontrado' : 'No encontrado'}`);
    
    return {
      filename: file,
      path: exists ? filePath : null,
      cid: `img${index}`
    };
  }).filter(att => att.path !== null);

  console.log(`✅ ${attachments.length} imágenes cargadas`);
  return attachments;
};

// ✅ CONTROLADOR — CONTACTO
exports.enviarContacto = async (req, res) => {
  console.log("\n=== INICIANDO enviarContacto ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  const { nombre, email, telefono, asunto, mensaje } = req.body;

  if (!nombre || !email || !asunto || !mensaje) {
    console.error("❌ Datos incompletos:", { nombre, email, asunto, mensaje });
    return res.status(400).json({ 
      message: "Datos incompletos",
      required: ["nombre", "email", "asunto", "mensaje"],
      received: { nombre, email, telefono, asunto, mensaje }
    });
  }

  try {
    console.log("1. Cargando template...");
    let html = loadTemplate();

    html = html
      .replace(/{{nombre}}/g, nombre)
      .replace(/{{email}}/g, email)
      .replace(/{{telefono}}/g, telefono || "No proporcionado")
      .replace(/{{asunto}}/g, asunto)
      .replace(/{{mensaje}}/g, mensaje);

    console.log("2. Cargando imágenes...");
    const attachments = loadImages();

    console.log("3. Preparando email...");
    const fromAddress = process.env.EMAIL_FROM 
      ? `"${process.env.EMAIL_FROM_NAME || 'SoundSpace'}" <${process.env.EMAIL_FROM}>`
      : `"SoundSpace" <${process.env.CORREO_APP}>`;
    
    console.log("   From:", fromAddress);
    console.log("   To:", email);
    console.log("   Subject: En breve te atenderemos ✅");

    if (!transporter) {
      console.error("❌ Transporter no disponible");
      return res.status(500).json({ message: "Error de configuración de email" });
    }

    console.log("4. Enviando email...");
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "En breve te atenderemos ✅",
      html,
      attachments
    });

    console.log("✅ Email enviado exitosamente");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", info.response || "Sin respuesta");

    res.json({ 
      message: "Correo enviado correctamente ✅",
      debug: {
        messageId: info.messageId,
        from: fromAddress,
        to: email
      }
    });

  } catch (error) {
    console.error("❌ ERROR en enviarContacto:");
    console.error("   Mensaje:", error.message);
    console.error("   Stack:", error.stack);
    
    if (error.code) console.error("   Código:", error.code);
    if (error.command) console.error("   Comando:", error.command);
    
    res.status(500).json({ 
      message: "Error enviando correo ❌",
      debug: {
        error: error.message,
        code: error.code,
        service: process.env.EMAIL_SERVICE || "No definido"
      }
    });
  }
};

// CARGAR TEMPLATE email2.html
const loadTemplate2 = () => {
  const templatePath = path.join(__dirname, "../email2.html");
  console.log("Buscando template2 en:", templatePath);
  
  if (!fs.existsSync(templatePath)) {
    console.error("❌ Archivo email2.html NO encontrado");
    return "<h1>Gracias por suscribirte!</h1>";
  }
  
  console.log("✅ Template2 encontrado");
  return fs.readFileSync(templatePath, "utf8");
};

// CARGAR SÓLO LAS 3 IMÁGENES DE LA SUSCRIPCIÓN
const loadImages2 = () => {
  const imgDir = path.join(__dirname, "../uploads");
  console.log("Buscando imágenes para suscripción en:", imgDir);

  if (!fs.existsSync(imgDir)) {
    console.error("❌ Carpeta uploads NO encontrada");
    return [];
  }

  const selectedImages = [
    "d3ad6d5706d88328a51ff404a2591a50.png",
    "dd7b59e793dcfe6e47f4cde80d34b0de.png",
    "2e07a545492769fc9c4c1763dff59f5e.png"
  ];

  const attachments = selectedImages.map((file, index) => {
    const filePath = path.join(imgDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}: ${exists ? 'Encontrado' : 'No encontrado'}`);
    
    return {
      filename: file,
      path: exists ? filePath : null,
      cid: `img${index}`
    };
  }).filter(att => att.path !== null);

  console.log(`✅ ${attachments.length} imágenes cargadas para suscripción`);
  return attachments;
};

// CONTROLADOR — SUSCRIPCIÓN
exports.enviarSuscripcion = async (req, res) => {
  console.log("\n=== INICIANDO enviarSuscripcion ===");
  const { email } = req.body;

  if (!email) {
    console.error("❌ Email requerido para suscripción");
    return res.status(400).json({ message: "Correo requerido ❌" });
  }

  console.log("Email para suscripción:", email);

  try {
    let html = loadTemplate2();

    const fromAddress = process.env.EMAIL_FROM 
      ? `"${process.env.EMAIL_FROM_NAME || 'SoundSpace'}" <${process.env.EMAIL_FROM}>`
      : `"SoundSpace" <${process.env.CORREO_APP}>`;
    
    console.log("From:", fromAddress);
    console.log("To:", email);

    if (!transporter) {
      console.error("❌ Transporter no disponible");
      return res.status(500).json({ message: "Error de configuración de email" });
    }

    console.log("Enviando email de suscripción...");
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "¡Gracias por suscribirte!",
      html,
      attachments: loadImages2()
    });

    console.log("✅ Email de suscripción enviado");
    console.log("   Message ID:", info.messageId);

    res.json({ 
      message: "Correo de suscripción enviado ✅",
      debug: {
        messageId: info.messageId
      }
    });

  } catch (error) {
    console.error("❌ ERROR en enviarSuscripcion:", error.message);
    console.error("   Stack:", error.stack);
    
    res.status(500).json({ 
      message: "Error enviando correo de suscripción ❌",
      debug: {
        error: error.message,
        service: process.env.EMAIL_SERVICE || "No definido"
      }
    });
  }
};