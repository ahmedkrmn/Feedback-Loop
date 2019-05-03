const router = require('express').Router();
const array = require('lodash/array');
const Path = require('path-parser').default;
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');
const path = require('path');

const Survey = mongoose.model('surveys');

//* For testing only
router.get('/api/surveys', requireLogin, async (req, res) => {
  const surveys = await Survey.find({ _user: req.user.id }).select({
    recipients: false
  });
  res.send(surveys);
});

router.get('/api/survey/:surveyId/:choice', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'voted.html'));
});

router.post('/api/survey/webhook', (req, res) => {
  const p = new Path('/api/survey/:surveyId/:choice');

  array
    .chain(req.body)
    .map(({ email, url }) => {
      if (!url) return undefined;
      const match = p.test(new URL(url).pathname);
      if (match) {
        return { email, surveyId: match.surveyId, choice: match.choice };
      }
    })
    .compact()
    .uniqBy('email', 'surveyId')
    .each(({ surveyId, email, choice }) => {
      Survey.updateOne(
        {
          _id: surveyId,
          recipients: {
            $elemMatch: { email: email, responded: false }
          }
        },
        {
          $inc: { [choice]: 1 },
          $set: { 'recipients.$.responded': true },
          lastResponded: new Date()
        }
      ).exec();
    })
    .value();
  //* There is no need to await the execution of the query because it's all happening behind our backs with no control over what happens if the promise resolve or not. That's why we use .exec()
  res.send({});
});

router.get('/survey/new', requireLogin, requireCredits, async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'survey-form.html'));
});

router.post('/survey/submit', requireLogin, requireCredits, (req, res) => {
  const { emails } = req.body;
  const emailList = emails.split(',').map(email => email.trim());
  res.render('submit', {
    emailList,
    subject: req.body.subject,
    body: req.body.body,
    title: req.body.survey_name
  });
});

router.post('/survey/send', requireLogin, requireCredits, async (req, res) => {
  const { title, subject, body, recipients } = req.body;
  const survey = new Survey({
    title,
    subject,
    body,
    recipients: recipients
      .split(',')
      .filter(Boolean)
      .map(email => ({ email: email.trim() })),
    _user: req.user.id,
    dateSent: Date.now()
  });

  const mailer = new Mailer(survey, surveyTemplate(survey));

  try {
    await mailer.sendMail();
    await survey.save();
    req.user.credits -= 1;
    const user = await req.user.save();
    console.log('Mails sent successfully');
    res.send(user);
  } catch (err) {
    res.status(422).send(err.toString());
    console.log('Error, mails were not sent');
  }
});

module.exports = router;
