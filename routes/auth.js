const router = require('express').Router();
const passport = require('passport');

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/api/verify', (req, res) => {
  if (req.user) {
    res.send(req.user);
  } else {
    res.send({ error: 'Not authorized!' });
  }
});

module.exports = router;
