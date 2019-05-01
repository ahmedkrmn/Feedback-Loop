const router = require('express').Router();
const charge = require('../services/stripe');

router.post('/checkout', async (req, res) => {
  try {
    const data = await charge(req);
    console.log(data);
    res.redirect('/');
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
