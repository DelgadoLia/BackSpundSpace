const nodemailer = require('nodemailer');

console.log("=== CONFIG/EMAIL.JS CARGADO ===");
console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "No definido (usando 'sendgrid' por defecto)");
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ Existe" : "❌ No existe");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "No definido");
console.log("CORREO_APP:", process.env.CORREO_APP || "No definido");

const createTransporter = () => {
  const service = process.env.EMAIL_SERVICE || 'sendgrid';
  console.log(`\nCreando transporter para servicio: ${service}`);
  
  if (service === 'sendgrid') {
    console.log("Configurando SendGrid...");
    console.log("Host: smtp.sendgrid.net");
    console.log("Port: 587");
    console.log("User: apikey");
    console.log("Pass:", process.env.SENDGRID_API_KEY ? "✅ Definida" : "❌ NO DEFINIDA - ESTE ES EL PROBLEMA");
    
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY no está definida en las variables de entorno");
    }
    
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  
  console.log("Configurando Gmail (fallback)...");
  const user = process.env.EMAIL_USER || process.env.CORREO_APP;
  const pass = process.env.EMAIL_PASSWORD || process.env.PASS_APP;
  
  console.log("User:", user || "No definido");
  console.log("Pass:", pass ? "✅ Definida" : "❌ No definida");
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: user,
      pass: pass
    }
  });
};

module.exports = { createTransporter };