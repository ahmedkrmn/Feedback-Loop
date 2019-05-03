const router = require('express').Router();
const mongoose = require('mongoose');

const User = mongoose.model('users');
const Survey = mongoose.model('surveys');

router.get('/dashboard', async (req, res) => {
  const existingUser = await User.findById(req.user.id);
  const userSurveys = await Survey.find({ _user: req.user.id }).select({
    recipients: false
  });
  res.render('dashboard', {
    credits: existingUser.credits,
    userSurveys
  });
});
module.exports = router;
