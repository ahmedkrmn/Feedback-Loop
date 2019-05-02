const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);

module.exports = req => {
  const token = req.body.stripeToken;
  return stripe.charges.create({
    amount: 499,
    currency: 'USD',
    source: token,
    description: '4.99$ for 5 credits',
    metadata: {}
  });
};
