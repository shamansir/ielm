'use strict';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/monokai.css');

require('./codemirror.css');
require('./tabs.css');
require('./preview.css');
require('./cell.css');

require('whatwg-fetch');

const CodeMirror = require('codemirror');
require('codemirror/mode/elm/elm');

const importScript = require('./import-script.js');

const Tabs = require('./tabs.js');
const Preview = require('./preview.js');

const codemirrorOptions = {
  value: '"foobar"',
  mode: 'elm',
  lineNumbers: true,
  autofocus: true
};

function compile(content, screenId) {
  return fetch('http://localhost:3000/compile', {
    method: "POST",
    body: JSON.stringify({
      user: "user",
      package: "project",
      packageVer: "1.0.0",
      elmVer: "0.18.0",
      screenId: screenId,
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

class App {

  constructor() {
    this.screenCount = 0;
    this.previews = []; // Screen ID to Preview Element
    this.tabs = []; // Screen ID to Tab Panel
  }

  start() {
    this.addScreen(document.body);
  }

  addScreen(target) {
    const screenId = this.screenCount;
    const codemirrorWrapper = document.createElement('div');
    const tabPanelInstance = new Tabs(screenId);
    const previewInstance = new Preview(screenId);
    target.appendChild(codemirrorWrapper);
    target.appendChild(tabPanelInstance.getElement());
    target.appendChild(previewInstance.getElement());
    this.previews.push(previewInstance);
    this.tabs.push(tabPanelInstance);
    const codemirrorInstance = CodeMirror(codemirrorWrapper, codemirrorOptions);

    codemirrorInstance.on('keypress', (cm, event) => {
      if (event.keyCode == 13 && event.shiftKey) {
        previewInstance.busy();
        this.onScreenUpdate(cm, screenId);
        event.stopPropagation();
        event.preventDefault();
      }
    });

    this.screenCount++;
  }

  onScreenUpdate(cm, screenId) {
    const previews = this.previews;
    compile(cm.getValue(), screenId)
      .then(function(screenJson) {
        if (!screenJson.error) {
          const version = screenJson.version;
          const moduleName = `Screen${screenId}_v${version}`;
          return new Promise((resolve, reject) => {
            importScript(`./build/${moduleName}.js`, () => {
              const Screen = Elm[moduleName];
              previews[screenId].update(screenJson, Screen);
            }, reject);
          });
        } else throw new Error(screenJson.error);
      }).catch(function(ex) {
        console.error('parsing failed', ex);
        previews[screenId].error(ex.message);
      });
      //console.log(elmDocument);
  }

}

module.exports = App;

