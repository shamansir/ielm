'use strict';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/monokai.css');
require('./index.css');

require('whatwg-fetch');

const unique = require('array-unique').immutable;
const Counter = require('./Counter.elm');
const mountNode = document.getElementById('elm-app');
const CodeMirror = require('codemirror');
require('codemirror/mode/elm/elm');

let instanceCount = 0;

const elmDocument = {
    imports: [],
    chunks: [] // array of arrays: CodeMirror instances to lines
};

const codemirrorOptions = {
    value: "foo = \"bar\"",
    mode: "elm",
    lineNumbers: true,
    autofocus: true
};

function elmDocumentToFileContent(elmDoc) {
    return elmDoc.imports.map((importBody) => 'import ' + importBody)
        .concat(elmDoc.chunks.map((lines, index) => lines.join('\n')))
        .join('\n');
}

function compile(elmFileContent) {
    fetch('http://localhost:3000/compile', {
        method: "POST",
        body: JSON.stringify({ outcoming: elmFileContent }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin"
    }).then(function(response) {
        return response.json()
    }).then(function(json) {
        console.log('parsed json', json)
    }).catch(function(ex) {
        console.log('parsing failed', ex)
    });
}

function onInstanceUpdate(cm, instanceId) {
    elmDocument.chunks[instanceId] = [];
    cm.eachLine(function(handle) {
        if (handle.text.indexOf(':import ') == 0) {
            // FIXME: only if this import is known library
            elmDocument.imports = unique(elmDocument.imports.concat([ handle.text.slice(8) ]));
        } else if (handle.text.indexOf('import ') < 0) {
            elmDocument.chunks[instanceId].push(handle.text);
        }
    });
    compile(elmDocumentToFileContent(elmDocument));
    //console.log(elmDocument);
}

function addInstance(target) {
    const instanceId = instanceCount;
    const codemirrorWrapper = document.createElement('div');
    const previewInstance = document.createElement('div');
    target.appendChild(codemirrorWrapper);
    target.appendChild(previewInstance);
    const codemirrorInstance = CodeMirror(codemirrorWrapper, codemirrorOptions);

    codemirrorInstance.on('keypress', (cm, event) => {
        if (event.keyCode == 13 && event.shiftKey) {
            onInstanceUpdate(cm, instanceId);
            event.stopPropagation();
            event.preventDefault();
        }
    });

    instanceCount++;
}

//document.addEventListener('DOMContentLoaded', function() {
    addInstance(document.body);
//});

// The third value on embed are the initial values for incomming ports into Elm
//var app = Counter.Main.embed(mountNode);
