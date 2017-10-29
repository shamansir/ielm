'use strict';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/monokai.css');
require('./index.css');

require('whatwg-fetch');

const Counter = require('./Counter.elm');
const mountNode = document.getElementById('elm-app');
const CodeMirror = require('codemirror');
require('codemirror/mode/elm/elm');

let cellCount = 0;

const codemirrorOptions = {
    value: '"foobar"',
    mode: 'elm',
    lineNumbers: true,
    autofocus: true
};

const previews = []; // Cell ID to Preview Element

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

// :type
// :kind

function onCellUpdate(cm, cellId) {
    compile(cm.getValue(), cellId)
        .then(function(chunksJson) {
            if (!chunksJson.error) {
                console.log('received json', chunksJson);
                renderResponse(previews[cellId], chunksJson);
            } else throw new Error(chunksJson.error);
        }).catch(function(ex) {
            console.log('parsing failed', ex);
            renderError(previews[cellId], ex.message);
        });
    //console.log(elmDocument);
}

function addCell(target) {
    const cellId = cellCount;
    const codemirrorWrapper = document.createElement('div');
    const previewInstance = document.createElement('div');
    previewInstance.className = 'preview preview--empty';
    previewInstance.innerText = '<Empty>';
    target.appendChild(codemirrorWrapper);
    target.appendChild(previewInstance);
    previews.push(previewInstance);
    const codemirrorInstance = CodeMirror(codemirrorWrapper, codemirrorOptions);

    codemirrorInstance.on('keypress', (cm, event) => {
        if (event.keyCode == 13 && event.shiftKey) {
            previewInstance.className = 'preview preview--rendering';
            previewInstance.innerText = '<Compiling...>';
            onCellUpdate(cm, cellId);
            event.stopPropagation();
            event.preventDefault();
        }
    });

    cellCount++;
}

function renderError(previewTarget, error) {
    previewTarget.className = 'preview preview--error';
    previewTarget.innerText = error;
}

function renderResponse(previewTarget, json) {
    previewTarget.className = 'preview';
    previewTarget.innerHTML = '';
    if (!json.error) {
        const typeElms = json.types.map((type) => type.name)
            .map((typeName) => {
                const typeElm = document.createElement('span');
                typeElm.innerText = typeElm.textContent = typeName;
                return typeElm;
            });
        for (const typeElmIndex in typeElms) {
            previewTarget.appendChild(typeElms[typeElmIndex]);
        }
    } else {
        const codeElm = document.createElement('code');
        codeElm.innerText = json.error;
        previewTarget.appendChild(codeElm);
    }
}

//document.addEventListener('DOMContentLoaded', function() {
    addCell(document.body);
//});

// The third value on embed are the initial values for incomming ports into Elm
//var app = Counter.Main.embed(mountNode);
