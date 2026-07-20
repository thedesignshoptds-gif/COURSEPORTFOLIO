const crypto = require('crypto');
const { validateBuyer } = require('./_lib/validate');
const { sendBuyerConfirmation, sendAdminNotification } = require('./_lib/email');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    amountInr,
  } = body;

  if (!orderId || !paymentId || !signature) {
    res.status(400).json({ error: 'Missing payment details.' });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    res.status(500).json({ error: 'Server is not configured.' });
    return;
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedSignature, 'utf8');
  const actualBuf = Buffer.from(String(signature), 'utf8');
  const isValid =
    expectedBuf.length === actualBuf.length &&
    crypto.timingSafeEqual(expectedBuf, actualBuf);

  if (!isValid) {
    console.error('Payment signature mismatch', { orderId, paymentId });
    res.status(400).json({ error: 'We couldn’t verify that payment. If money was deducted, please contact us and we’ll sort it out.' });
    return;
  }

  const { valid, clean } = validateBuyer(body);
  const buyer = valid ? clean : { name: 'there', email: body.email || '', whatsapp: body.whatsapp || '' };

  const results = await Promise.allSettled([
    buyer.email ? sendBuyerConfirmation({ name: buyer.name, email: buyer.email, amountInr: amountInr || '' }) : Promise.resolve(),
    sendAdminNotification({ name: buyer.name, email: buyer.email, whatsapp: buyer.whatsapp, amountInr: amountInr || '', paymentId })
  ]);

  results.forEach((r, idx) => {
    const type = idx === 0 ? 'Buyer Confirmation' : 'Admin Notification';
    if (r.status === 'rejected') {
      console.error(`${type} email failed to send:`, r.reason);
    } else if (r.value && r.value.error) {
      console.error(`${type} email failed to send:`, r.value.error);
    } else if (r.value && r.value.data) {
      console.log(`${type} email sent successfully:`, r.value.data);
    }
  });

  res.status(200).json({ verified: true, paymentId });
};
