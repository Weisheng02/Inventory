// Vercel catch-all serverless entry so /api/* routes are handled by Express
const app = require('../src/app');

module.exports = (req, res) => {
  return app(req, res);
};


