var express = require('express')
  , app = express();

app.disable('x-powered-by');
app.use(express.static('build'))

module.exports = app;
