const REGULAR_PRICE_INR = 2499;
const COUPON_PRICE_INR = 1195;
const VALID_COUPON = 'BHAKTIHISHAKTIHAI';

function resolvePrice(couponCode) {
  const normalized = String(couponCode || '').trim().toUpperCase();
  const applied = normalized.length > 0 && normalized === VALID_COUPON;
  const amountInr = applied ? COUPON_PRICE_INR : REGULAR_PRICE_INR;
  return {
    applied,
    amountInr,
    amountPaise: amountInr * 100
  };
}

module.exports = { resolvePrice, REGULAR_PRICE_INR, COUPON_PRICE_INR };
