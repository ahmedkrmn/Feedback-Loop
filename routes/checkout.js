const router = require('express').Router();
const requireLogin = require('../middlewares/requireLogin');
const charge = require('../services/stripe');

router.post('/checkout', requireLogin, async (req, res) => {
  try {
    await charge(req);
    req.user.credits += 5;
    await req.user.save();
    res.render('paymentSuccess', {
      credits: req.user.credits
    });
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
