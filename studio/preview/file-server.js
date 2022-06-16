const express = require('express');
const hbs = require('handlebars');
const merge = require('lodash.merge');
const { writeFileSync, readFileSync, mkdirSync } = require('fs');

const app = express();

app.use(express.json());

const template = hbs.compile(readFileSync('../pages/universal-search-page/template.tsx.hbs', 'utf8'));
const mainTemplate = hbs.compile(readFileSync('./components/templates/main.tsx.hbs', 'utf8'));

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
  response.setHeader('access-control-allow-origin', '*');
  response.send();
  const pageConfig = request.body;
  const { pageId, pageName } = pageConfig;

  mkdirSync(`../../src/pages`);
  mkdirSync(`../../src/pages/${pageId}`);
  writeFileSync(`../../src/pages/${pageId}/${pageId}.tsx`, template(pageConfig));
  writeFileSync(`../../src/pages/${pageId}/${pageId}.json`, '{}');

  writeFileSync('./main.tsx', mainTemplate(pageConfig));
});

app.listen(8080);