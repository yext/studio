const express = require('express');
const hbs = require('handlebars');
const merge = require('lodash.merge');
const { writeFileSync, readFileSync, mkdirSync } = require('fs');

const app = express();

app.use(express.json());

const template = hbs.compile(readFileSync('../pages/template.tsx.hbs', 'utf8'));
const mainTemplate = hbs.compile(readFileSync('./components/templates/main.tsx.hbs', 'utf8'));

app.options('/*', function(request, response) {
  response.setHeader('access-control-allow-headers', 'content-type');
  response.setHeader('access-control-allow-origin', '*');
  response.send();
});

app.post('/update/*', function(request, response){
  const pageId = request.url.split('/')[2];
  const componentId = request.url.split('/')[3];

  const existingPageConfig = 
    JSON.parse(readFileSync(`../../src/pages/${pageId}/${pageId}.json`, { encoding: 'utf8' }));

  response.setHeader('access-control-allow-origin', '*');
  response.send();
  const incomingComponentConfig = request.body;

  let updatedComponentConfig = incomingConfig;
  const existingComponentConfig = 
    existingPageConfig.components && 
    existingPageConfig.components.find(component => component.id === componentId);
  
  if (existingComponentConfig) {
    updatedComponentConfig = merge(existingComponentConfig, incomingComponentConfig);
  }

  if (existingPageConfig.components) {
    existingPageConfig.components = 
      existingPageConfig.components.filter(component => component.id !== componentId);
    existingPageConfig.components.append(updatedComponentConfig);
  } else {
    existingPageConfig.components = [ updatedComponentConfig ];
  }
  
  writeFileSync(`../../src/pages/${pageId}/${pageId}.json`, JSON.stringify(existingPageConfig, '\t'));
});

app.post('/create-page', function(request, response){
  response.setHeader('access-control-allow-origin', '*');
  response.send();
  const pageConfig = request.body;
  const { id } = pageConfig;

  mkdirSync(`../../src/pages`);
  mkdirSync(`../../src/pages/${id}`);
  writeFileSync(`../../src/pages/${id}/${id}.tsx`, template(pageConfig));
  writeFileSync(`../../src/pages/${id}/${id}.json`, JSON.stringify(pageConfig));

  writeFileSync('./main.tsx', mainTemplate(pageConfig));
});

app.listen(8080);