const sgMail = require('@sendgrid/mail');
const keys = require('../config/keys');

class Mailer {
  constructor({ subject, recipients }, html) {
    sgMail.setApiKey(keys.sendGridKey);
    const msg = {
      //* Extract all emails from the recipients sub document collection of the sent survey document
      to: recipients.map(({ email }) => email),
      from: 'no-reply@Feedback-Loop.com',
      subject,
      html,
      categories: ['Survey'],
      trackingSettings: {
        clickTracking: {
          enable: true
        },
        openTracking: {
          enable: true
        },
        subscriptionTracking: {
          enable: true
        }
      }
    };
    this.msg = msg;
  }
  sendMail() {
    return sgMail.sendMultiple(this.msg);
  }
}

module.exports = Mailer;
