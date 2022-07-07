/**
 * @deprecated
 * Use vite messaging through the studio plugin instead.
 * This file is scheduled to be deleted.
 */

const express = require('express');
// const mkdirp = require('mkdirp');
// const hbs = require('handlebars');
const merge = require('lodash/merge');
const cloneDeep = require('lodash/clonedeep');
const { writeFileSync, readFileSync } = require('fs');
const path = require('path');
const updatePageFile = require('./ts-parsing/updatePageFile');

const pathToSrcDir = path.resolve(__dirname, '../src');

const app = express();

app.use(express.json());

// const template = hbs.compile(readFileSync('./studio/pages/template.tsx.hbs', 'utf8'));
// const mainTemplate = hbs.compile(readFileSync('./studio/preview/components/templates/main.tsx.hbs', 'utf8'));

app.options('/*', function(_request, response) {
  response.setHeader('access-control-allow-headers', 'content-type');
  response.setHeader('access-control-allow-origin', '*');
  response.send();
});

app.post('/update/*', function(request, response){
  const pageId = request.url.split('/')[2];
  const componentId = request.url.split('/')[3];

  const existingPageConfig =
    JSON.parse(readFileSync(`../src/pages/${pageId}/${pageId}.json`, { encoding: 'utf8' }));

  response.setHeader('access-control-allow-origin', '*');
  response.send();
  const incomingComponentConfig = request.body;

  let updatedComponentConfig = incomingComponentConfig;
  const existingComponentConfig =
    existingPageConfig.components?.find(component => component.id === componentId);

  if (existingComponentConfig) {
    updatedComponentConfig = merge(cloneDeep(existingComponentConfig), incomingComponentConfig);
  }

  let newComponents;
  if (existingPageConfig.components) {
    newComponents =
      existingPageConfig.components.filter(component => component.id !== componentId);
    newComponents.push(updatedComponentConfig);
  } else {
    newComponents = [ updatedComponentConfig ];
  }

  const newPageConfig = cloneDeep(existingPageConfig);
  newPageConfig.components = newComponents;

  writeFileSync(`../src/pages/${pageId}/${pageId}.json`, JSON.stringify(newPageConfig, null, 2));
});

app.post('/create-page', function(request, response){
  response.setHeader('access-control-allow-origin', '*');
  response.send();
  // const pageConfig = request.body;
  // const { id } = pageConfig;

  // mkdirp.sync(`../src/pages/${id}`);
  // writeFileSync(`../src/pages/${id}/${id}.tsx`, template(pageConfig));
  // writeFileSync(`../src/pages/${id}/${id}.json`, JSON.stringify(pageConfig, null, 2));

  // writeFileSync('./main.tsx', mainTemplate(pageConfig));
});

app.post('/write-file/:filePath', (req, res) => {
  res.setHeader('access-control-allow-origin', '*');
  if (!req.params.filePath) {
    res.status(400).send('No filepath specified to write to');
  }
  try {
    const fullFilePath = path.resolve(pathToSrcDir, req.params.filePath);
    writeFileSync(fullFilePath, req.body.value);
    res.send('successfully edited: ' + path.relative(pathToSrcDir, fullFilePath));
  } catch (e) {
    res.status(500).send(e.toString());
    console.error(e);
  }
});

app.post('/update-page-component-props', (req, res) => {
  res.setHeader('access-control-allow-origin', '*');
  try {
    const fullFilePath = path.resolve(pathToSrcDir, 'pages/index.tsx');
    updatePageFile(req.body.updatedState);
    res.send('successfully edited: ' + path.relative(pathToSrcDir, fullFilePath));
  } catch (e) {
    res.status(500).send(e.toString());
    console.error(e);
  }
});

app.listen(8080);