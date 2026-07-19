const { Resend } = require('resend');

const FROM = 'The Design Shop <onboarding@resend.dev>';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function sendBuyerConfirmation({ name, email, amountInr }) {
  const resend = getResendClient();
  if (!resend) return { skipped: true, reason: 'RESEND_API_KEY not set' };

  return resend.emails.send({
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
  const resend = getResendClient();
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!resend || !adminEmail) return { skipped: true, reason: 'RESEND_API_KEY or ADMIN_NOTIFY_EMAIL not set' };

  return resend.emails.send({
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
