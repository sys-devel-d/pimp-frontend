const express = require('express');
const app = express();
const path = require('path');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/dist'));

app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
