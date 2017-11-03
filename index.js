'use strict';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/monokai.css');
require('./index.css');

require('whatwg-fetch');

const CodeMirror = require('codemirror');
require('codemirror/mode/elm/elm');

const importScript = require('./import-script.js');

const Tabs = require('./tabs.js');
const Preview = require('./preview.js');

const mountNode = document.getElementById('elm-app');

let cellCount = 0;

const codemirrorOptions = {
  value: '"foobar"',
  mode: 'elm',
  lineNumbers: true,
  autofocus: true
};

const previews = []; // Cell ID to Preview Element
const tabs = []; // Cell ID to Tab Panel

function compile(content, cellId) {
  return fetch('http://localhost:3000/compile', {
    method: "POST",
    body: JSON.stringify({
      user: "user",
      package: "project",
      packageVer: "1.0.0",
      elmVer: "0.18.0",
      cellId: cellId,
      document: content
    }),
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin"
  }).then(function(response) {
    return response.json()
  });
}

function onCellUpdate(cm, cellId) {
  compile(cm.getValue(), cellId)
    .then(function(chunksJson) {
      if (!chunksJson.error) {
        const version = chunksJson.version;
        const moduleName = `Chunk${cellId}_${version}`;
        return new Promise((resolve, reject) => {
          importScript(`./build/${moduleName}.js`, () => {
            const Chunk = Elm[moduleName];
            console.log(Chunk);
            previews[cellId].update(chunksJson, Chunk);
          }, reject);
        });
      } else throw new Error(chunksJson.error);
    }).catch(function(ex) {
      console.error('parsing failed', ex);
      previews[cellId].error(ex.message);
    });
    //console.log(elmDocument);
}

function addCell(target) {
  const cellId = cellCount;
  const codemirrorWrapper = document.createElement('div');
  const tabPanelInstance = new Tabs(cellId);
  const previewInstance = new Preview(cellId);
  target.appendChild(codemirrorWrapper);
  target.appendChild(tabPanelInstance.getElement());
  target.appendChild(previewInstance.getElement());
  previews.push(previewInstance);
  tabs.push(tabPanelInstance);
  const codemirrorInstance = CodeMirror(codemirrorWrapper, codemirrorOptions);

  codemirrorInstance.on('keypress', (cm, event) => {
    if (event.keyCode == 13 && event.shiftKey) {
      previewInstance.busy();
      onCellUpdate(cm, cellId);
      event.stopPropagation();
      event.preventDefault();
    }
  });

  cellCount++;
}

//document.addEventListener('DOMContentLoaded', function() {
  addCell(document.body);
//});

// The third value on embed are the initial values for incomming ports into Elm
//var app = Counter.Main.embed(mountNode);
