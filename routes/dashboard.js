const router = require('express').Router();
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const User = mongoose.model('users');
const Survey = mongoose.model('surveys');

router.get('/dashboard', requireLogin, async (req, res) => {
  const existingUser = await User.findById(req.user.id);
  const userSurveys = await Survey.find({ _user: req.user.id })
    .select({
      recipients: false
    })
    .sort({ lastResponded: -1 });
  res.render('dashboard', {
    credits: existingUser.credits,
    userSurveys
  });
});
module.exports = router;
