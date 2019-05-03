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
require('./models/Survey');
require('./services/passport');
const surveyRoutes = require('./routes/survey');
const dashboardRoutes = require('./routes/dashboard');

mongoose.connect(keys.mongoURI, { useNewUrlParser: true });
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//* parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//* parse application/json
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

//! Use the information (user.id) in req.session (added by cookie-session library to the req object), and adds "user" model class as a new req property. These two values "user.id" and "user" model class are controlled by passport.serializeUser() and passport.deserializeUser() functions.
app.use(passport.session());

app.get('/', (req, res) => {
  if (req.user) res.redirect('/dashboard');
  else res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.use('/', authRoutes);
app.use('/', checkoutRoutes);
app.use('/', surveyRoutes);
app.use('/', dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));
