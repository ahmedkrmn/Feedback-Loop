const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const checkoutRoutes = require('./routes/checkout');
const keys = require('./config/keys');
require('./models/User');
require('./services/passport');

mongoose.connect(keys.mongoURI, { useNewUrlParser: true });
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//* Set cookie age and encrypt/decrypt key
app.use(
  cookieSession({
    maxAge: 15 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

//* Initialize the passport library
app.use(passport.initialize());

//! Use the information in req.session (added by cookie-session library to the req object), and adds "user" as a new req property which contains the data provided through the passport.serializeUser() and passport.deserializeUser() functions.
app.use(passport.session());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use('/', authRoutes);
app.use('/', checkoutRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));
