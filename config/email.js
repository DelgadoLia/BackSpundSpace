const nodemailer = require('nodemailer');

const createTransporter = () => {
  const service = process.env.EMAIL_SERVICE || 'sendgrid';
  
  if (service === 'sendgrid') {
    // Configuración para SendGrid
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey', // ¡IMPORTANTE! Esto debe ser literalmente "apikey"
        pass: process.env.SENDGRID_API_KEY
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  
  // Fallback a Gmail (por si acaso)
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

module.exports = { createTransporter };