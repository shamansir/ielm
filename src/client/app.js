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
  value: '',
  mode: 'elm',
  lineNumbers: true,
  autofocus: true,
  indentWithTabs: false
};

class App {

  constructor() {
    this.screenCount = 0;
    this.previews = []; // Screen ID to Preview Element
    this.tabs = []; // Screen ID to Tab Panel
    refresh();
  }

  start(target) {
    this.addScreen(target);
    this.addButton(target);
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
        tabPanelInstance.informCompiling();
        this.onScreenUpdate(cm, screenId);
        event.stopPropagation();
        event.preventDefault();
      }
    });

    codemirrorInstance.on('change', () => {
      tabPanelInstance.informChanged();
    });

    // Codemirror indents with Tabs by default and even considering the option
    // `indentWithTabs`, keeps doing so. Here is the implementation to always do it
    // with spaces instead.
    // Source: https://github.com/codemirror/CodeMirror/issues/988#issuecomment-40874237
    codemirrorInstance.addKeyMap({
      Tab: (cm) => {
        if (cm.somethingSelected()) {
          cm.indentSelection("add");
          return;
        }

        if (cm.options.indentWithTabs)
          cm.replaceSelection("\t", "end", "+input");
        else
          cm.execCommand("insertSoftTab");
      },
      "Shift-Tab": (cm) => {
        cm.indentSelection("subtract");
      }
    });

    this.screenCount++;
  }

  addButton(target) {
    const addScreenButton = document.createElement('div');
    addScreenButton.className = 'add-screen';
    addScreenButton.innerText = '+';

    addScreenButton.addEventListener('click', () => {
      addScreenButton.remove();
      this.addScreen(target);
      this.addButton(target);
    });

    target.appendChild(addScreenButton);
  }

  onScreenUpdate(cm, screenId) {
    const previews = this.previews;
    const tabs = this.tabs;
    compile(cm.getValue(), screenId)
      .then(function(screenJson) {
        if (!screenJson.error) {
          const version = screenJson.version;
          const hash = screenJson.hash;
          const moduleName = `Screen${screenId}_v${version}_${hash}`;
          return new Promise((resolve, reject) => {
            importScript(`./${moduleName}.js`, () => {
              const Screen = Elm[moduleName];
              previews[screenId].update(screenJson, Screen);
              tabs[screenId].informCompiled();
              Object.keys(tabs).map((_screenId) => {
                if (_screenId != screenId) tabs[_screenId].informChanged();
              });
            }, reject);
          });
        } else throw new Error(screenJson.error);
      }).catch(function(ex) {
        console.error('parsing failed', ex);
        previews[screenId].error(ex.message);
        tabs[screenId].informError();
      });
      //console.log(elmDocument);
  }

}

const apiEndPoint = 'http://localhost:3000';

function refresh() {
  return fetch(`${apiEndPoint}/refresh`, {
    method: "GET"
  }).then(handleFetchError);
}

function compile(content, screenId) {
  return fetch(`${apiEndPoint}/compile`, {
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
  }).then(handleFetchError)
    .then(function(response) {
      return response.json()
    });
}

function handleFetchError(response) {
  if (!response.ok) {
    return { error: `Request failed. Ensure server is connected: ${response.statusText}` };
  }
  return response;
}


module.exports = App;

