const router = require('express').Router();
const _ = require('lodash');
const Path = require('path-parser').default;
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');
const path = require('path');

const Survey = mongoose.model('surveys');

router.get('/api/surveys', requireLogin, async (req, res) => {
  const surveys = await Survey.find({ _user: req.user.id }).select({
    recipients: false
  });

  res.send(surveys);
});

router.get('/api/survey/:surveyId/:choice', (req, res) => {
  res.render('thanks');
});

router.post('/api/survey/webhook', (req, res) => {
  const p = new Path('/api/survey/:surveyId/:choice');

  _.chain(req.body)
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
