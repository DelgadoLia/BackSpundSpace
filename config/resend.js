const { Resend } = require('resend');

let resendInstance = null;

const getResend = () => {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no está configurada');
    }
    resendInstance = new Resend(apiKey);
    console.log('✅ Resend configurado');
  }
  return resendInstance;
};

// Función para enviar email CON attachments
const sendEmailWithAttachment = async ({ to, subject, html, from, attachments = [] }) => {
  try {
    const resend = getResend();
    
    const fromAddress = from || process.env.EMAIL_FROM || 'SoundSpace <talesturntable@gmail.com>';
    
    console.log(`📧 Enviando email con attachment a: ${to}`);
    
    // Preparar attachments para Resend
    const resendAttachments = attachments.map(att => ({
      filename: att.filename,
      content: att.content.toString('base64') // Resend espera base64
    }));

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: to,
      subject: subject,
      html: html,
      attachments: resendAttachments.length > 0 ? resendAttachments : undefined
    });

    if (error) {
      console.error('❌ Error Resend:', error);
      throw error;
    }

    console.log('✅ Email enviado con ID:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    throw error;
  }
};

// Para emails sin attachments (más simple)
const sendEmail = async ({ to, subject, html, from }) => {
  return sendEmailWithAttachment({ to, subject, html, from });
};

module.exports = { getResend, sendEmail, sendEmailWithAttachment };