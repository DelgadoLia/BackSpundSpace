const nodemailer = require('nodemailer');

console.log("=== CONFIG/EMAIL.JS CARGADO (GMAIL) ===");
console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE);
console.log("EMAIL_USER:", process.env.EMAIL_USER || process.env.CORREO_APP);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✅ Definida" : "❌ No definida");

const createTransporter = () => {
  const service = process.env.EMAIL_SERVICE || 'gmail';
  console.log(`Creando transporter para: ${service}`);
  
  if (service === 'sendgrid') {
    // Mantener por compatibilidad
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // CONFIGURACIÓN GMAIL OPTIMIZADA PARA RENDER
  const user = process.env.EMAIL_USER || process.env.CORREO_APP;
  const pass = process.env.EMAIL_PASSWORD || process.env.PASS_APP;
  
  console.log("Usuario Gmail:", user);
  
  if (!user || !pass) {
    throw new Error('Faltan credenciales de Gmail. Verifica EMAIL_USER y EMAIL_PASSWORD');
  }
  
  return nodemailer.createTransport({
    service: 'gmail', // Esto automáticamente usa smtp.gmail.com:587
    auth: {
      user: user,
      pass: pass
    },
    // Configuraciones para evitar timeout en Render
    pool: true,
    maxConnections: 1,
    maxMessages: 10,
    socketTimeout: 10000, // 10 segundos
    connectionTimeout: 10000, // 10 segundos
    tls: {
      rejectUnauthorized: false // Importante para Render
    }
  });
};

module.exports = { createTransporter };