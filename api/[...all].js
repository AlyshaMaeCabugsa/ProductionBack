// /api/[...all].js
const app = require('../app'); // Make sure the path to your app.js is correct

module.exports = (req, res) => {
  app(req, res);
};
