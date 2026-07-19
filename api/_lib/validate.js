const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateBuyer({ name, email, whatsapp }) {
  const errors = [];

  const cleanName = String(name || '').trim();
  if (cleanName.length < 2 || cleanName.length > 100) {
    errors.push('Enter a valid name.');
  }

  const cleanEmail = String(email || '').trim();
  if (!EMAIL_RE.test(cleanEmail)) {
    errors.push('Enter a valid email address.');
  }

  const digits = String(whatsapp || '').replace(/[^\d]/g, '');
  if (digits.length < 8 || digits.length > 15) {
    errors.push('Enter a valid WhatsApp number, with country code.');
  }

  return {
    valid: errors.length === 0,
    errors,
    clean: { name: cleanName, email: cleanEmail.toLowerCase(), whatsapp: digits }
  };
}

module.exports = { validateBuyer };
