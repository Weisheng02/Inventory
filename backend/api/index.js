// Vercel serverless entry point
const app = require('../src/app');

module.exports = (req, res) => {
  return app(req, res);
};


