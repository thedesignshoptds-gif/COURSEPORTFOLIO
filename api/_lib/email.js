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
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1E1E1E;line-height:1.6;">
        <h2 style="margin-bottom:8px;">You're in, ${escapeHtml(name)}.</h2>
        <p style="margin-bottom:24px;">Your seat for <strong>The Design Session #4: The hire-ready portfolio</strong> is confirmed. You paid &#8377;${amountInr}.</p>
        
        <p>📱 You’ll be added to the WhatsApp group soon — that’s mission control for this whole thing. Updates, session links, daily homework, the occasional meme. Keep your notifications on.</p>
        
        <p>📅 First live session: 31st July. Put it in your calendar, tell your roommate not to bother you, maybe cancel that one plan you were dreading anyway.</p>
        
        <p>Now — go find your portfolio. Yes, that one. The one you haven’t opened since your last job application got ghosted. Open the tab. Stare at it. Feel slightly uncomfortable. That’s normal. That’s actually the goal.</p>
        
        <p>Because starting Day 01, we’re tearing it apart and rebuilding it — piece by piece, no judgment, just progress. Messy, half-finished, held together with hope? Perfect. Bring exactly that.</p>
        
        <p>See you on the 31st. Your portfolio doesn’t know what’s coming.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://youtu.be/dQw4w9WgXcQ?si=AYqxsjP2r-ZthPaW" style="background-color: #FF4B24; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; display: inline-block; text-align: center; box-shadow: 0 4px 14px rgba(255, 75, 36, 0.3);">
            Start Vibing
          </a>
        </div>

        <p style="margin-top:24px;color:#6C6D61;font-size:13px;line-height:1.5;">
          Talk soon,<br>
          <strong>Satyam Dubey | The Design Shop</strong>
        </p>
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
