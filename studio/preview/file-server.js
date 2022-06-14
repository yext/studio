const express = require('express');
const { writeFileSync } = require('fs');

const app = express();

app.use(express.json());

app.options('/*', function(request, response) {
  response.setHeader('access-control-allow-headers', 'content-type');
  response.setHeader('access-control-allow-origin', '*');
  response.send();
});

app.post('/*', function(request, response){
  const moduleType = request.url.split('/')[1];
  response.setHeader('access-control-allow-origin', '*');
  response.send();
  const json = request.body;
  writeFileSync(`../src/config/${moduleType}-module.json`, JSON.stringify(request.body, '\t'));
});

app.listen(8080);