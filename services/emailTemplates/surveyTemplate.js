const keys = require('../../config/keys');

module.exports = survey => {
  return `
    <html>
      <body>
        <div style="text-align: center;">
          <h3>We appreciate your help!</h3>
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
