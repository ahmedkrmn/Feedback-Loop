const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);

module.exports = req => {
  const token = req.body.stripeToken;
  return stripe.charges.create({
    amount: 99,
    currency: 'USD',
    source: token,
    description: 'Credit',
    metadata: {}
  });
};
