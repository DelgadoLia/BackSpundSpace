const { Resend } = require('resend');

const createTransporter = () => {
  const service = process.env.EMAIL_SERVICE || 'resend';
  
  console.log("=== CONFIGURANDO EMAIL ===");
  console.log("Servicio:", service);
  
  if (service === 'resend') {
    console.log("✅ Configurando Resend");
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      throw new Error("RESEND_API_KEY no está definida en las variables de entorno");
    }
    
    return new Resend(apiKey);
  }
  
  // Para otros servicios (nodemailer)
  const nodemailer = require('nodemailer');
  
  if (service === 'brevo') {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  if (service === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  throw new Error(`Servicio de email no soportado: ${service}`);
};

module.exports = { createTransporter };