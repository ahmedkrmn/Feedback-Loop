const passport = require('passport');
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys');

//! This will use the the User schema created in the User.js in the models directory. This file is included after User.js in the index.js file so that's why it works.
//! This method was used because if we exported the User model through module.exports, when testing, an error might occur because we will be exporting multiple instances of the same module.
const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const existingUser = await User.findById(id);
  done(null, existingUser);
});
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true //! Allow HTTPS through proxies (Because Herouku uses proxies)
    },
    async (accessToken, refreshToken, profile, done) => {
      let existingUser = await User.findOne({ googleID: profile.id });
      if (!existingUser)
        existingUser = await new User({ googleID: profile.id }).save();
      done(null, existingUser);
    }
  )
);
