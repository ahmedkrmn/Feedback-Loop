const keys = require('../../config/keys');

module.exports = survey => {
  return `
    <html>
      <body>
        <div style="text-align: center;">
          <h3>We would like your feedback!</h3>
          <p>Have you enjoyed our service?</p>
          <p>${survey.body}</p>
          <div>
            <a href="${keys.redirectDomain}/api/survey/${survey.id}/yes">Yes</a>
          </div>
          <br />
          <div>
            <a href="${keys.redirectDomain}/api/survey/${survey.id}/no">No</a>
          </div>
        </div>
      </body>
    </html>
  `;
};
