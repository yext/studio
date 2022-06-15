const express = require('express');
const merge = require('lodash.merge');
const { writeFileSync, readFileSync } = require('fs');

const app = express();

app.use(express.json());

app.options('/*', function(request, response) {
  response.setHeader('access-control-allow-headers', 'content-type');
  response.setHeader('access-control-allow-origin', '*');
  response.send();
});

app.post('/update/*', function(request, response){
  const pageId = request.url.split('/')[2];
  response.setHeader('access-control-allow-origin', '*');
  response.send();
  const incomingConfig = request.body;

  const existingConfig = JSON.parse(readFileSync(`../../src/pages/${pageId}/${pageId}.json`, { encoding: 'utf8' }));
  const newConfig = merge(existingConfig, incomingConfig);

  writeFileSync(`../../src/pages/${pageId}/${pageId}.json`, JSON.stringify(newConfig, '\t'));
});

app.post('/create-page', function(request, response){
  const pageId = request.url.split('/')[1];
  response.setHeader('access-control-allow-origin', '*');
  response.send();
  const incomingConfig = request.body;

  const existingConfig = JSON.parse(readFileSync(`../../src/pages/${pageId}/${pageId}.json`, { encoding: 'utf8' }));
  const newConfig = merge(existingConfig, incomingConfig);

  writeFileSync(`../../src/pages/${pageId}/${pageId}.json`, JSON.stringify(newConfig, '\t'));
});

app.listen(8080);