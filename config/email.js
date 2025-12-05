const nodemailer = require('nodemailer');

const createTransporter = () => {
  const service = process.env.EMAIL_SERVICE || 'brevo';
  
  console.log("=== CONFIGURANDO EMAIL ===");
  console.log("Servicio:", service);
  console.log("Host:", process.env.EMAIL_HOST);
  console.log("Usuario:", process.env.EMAIL_USER);
  console.log("Password:", process.env.EMAIL_PASSWORD ? "✅ Existe" : "❌ No existe");
  
  if (service === 'brevo') {
    console.log("✅ Configurando Brevo SMTP");
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // IMPORTANTE: false para puerto 587
      auth: {
        user: process.env.EMAIL_USER, // 9d612a001@smtp-brevo.com
        pass: process.env.EMAIL_PASSWORD // v106Ip3GRyV5bsjS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  
  // Fallback a otros servicios
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

module.exports = { createTransporter };