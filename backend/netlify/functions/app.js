// Netlify Functions entry point
require('dotenv').config();
const serverless = require('serverless-http');
const app = require('../../src/app');

exports.handler = serverless(app);


