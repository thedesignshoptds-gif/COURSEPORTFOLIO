const { getRazorpayClient } = require('./_lib/razorpay');
const { resolvePrice } = require('./_lib/pricing');
const { validateBuyer } = require('./_lib/validate');

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

  const { valid, errors, clean } = validateBuyer(body);
  if (!valid) {
    res.status(400).json({ error: errors.join(' ') });
    return;
  }

  const { amountPaise, amountInr, applied } = resolvePrice(body.couponCode);

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `tds4_${Date.now()}`,
      notes: {
        name: clean.name,
        email: clean.email,
        whatsapp: clean.whatsapp,
        coupon_applied: String(applied)
      }
    });

    res.status(200).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      amountInr,
      currency: order.currency,
      buyer: clean
    });
  } catch (err) {
    console.error('create-order failed', err);
    res.status(502).json({ error: 'Could not start checkout right now. Please try again in a moment.' });
  }
};
