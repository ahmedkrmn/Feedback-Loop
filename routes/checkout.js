const router = require('express').Router();
const charge = require('../services/stripe');
const requireLogin = require('../middlewares/requireLogin');

router.post('/checkout', requireLogin, async (req, res) => {
  try {
    await charge(req);
    req.user.credits += 5;
    await req.user.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
