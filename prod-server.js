const express = require('express');
const app = express();
const path = require('path');

env = process.env.NODE_ENV || 'development';

app.set('port', (process.env.PORT || 5000));

const forceSsl = (req, res, next) => {
  if(req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.get('Host')}${req.url}`);
  }
  return next();
}

if(env === 'production') {
  app.use(forceSsl);
}

app.use(express.static(__dirname + '/dist'));

app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
