const Razorpay = require('razorpay');

let client = null;

function getRazorpayClient() {
  if (client) return client;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured on the server.');
  }
  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

module.exports = { getRazorpayClient };
