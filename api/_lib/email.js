const nodemailer = require('nodemailer');

const FROM = process.env.EMAIL_FROM || '"The Design Shop" <hello@thedesignshop.studio>';

function getTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendBuyerConfirmation({ name, email, amountInr }) {
  const transporter = getTransporter();
  if (!transporter) return { skipped: true, reason: 'Nodemailer SMTP user or pass not set' };

  return transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'You’re in — The Design Session #4',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1E1E1E;">
        <h2 style="margin-bottom:8px;">You're in, ${escapeHtml(name)}.</h2>
        <p>Your seat for <strong>The Design Session #4: The hire-ready portfolio</strong> is confirmed. You paid &#8377;${amountInr}.</p>
        <p>We'll send the session links and the WhatsApp group invite closer to the start date. If you don't hear from us within 48 hours, just reply to this email.</p>
        <p style="margin-top:24px;color:#6C6D61;font-size:13px;">The Design Shop</p>
      </div>
    `
  });
}

async function sendAdminNotification({ name, email, whatsapp, amountInr, paymentId }) {
  const transporter = getTransporter();
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!transporter || !adminEmail) return { skipped: true, reason: 'Nodemailer SMTP or ADMIN_NOTIFY_EMAIL not set' };

  return transporter.sendMail({
    from: FROM,
    to: adminEmail,
    subject: `New enrollment: ${name} (₹${amountInr})`,
    html: `
      <div style="font-family:sans-serif;">
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
        <p><strong>Amount paid:</strong> ₹${amountInr}</p>
        <p><strong>Payment ID:</strong> ${escapeHtml(paymentId)}</p>
      </div>
    `
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendBuyerConfirmation, sendAdminNotification };
