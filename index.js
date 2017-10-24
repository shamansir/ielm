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

let cellCount = 0;

const elmDocument = {
    imports: [],
    definitions: [], // array of arrays: Cell ID to lines
    chunks: [] // array of arrays: Cell ID to lines
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
        body: JSON.stringify({
            user: "user",
            package: "project",
            packageVer: "1.0.0",
            elmVer: "0.18.0",
            lines: elmFileContent
        }),
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

function isImport(line) {
    return line.indexOf('import ') == 0;
}

function isTypeDeclaration(line) {
    return line.match(/^\w+\s*:/) == 0;
}

function isDefinition(line) {
    return line.match(/^\w+\s*=/) == 0;
}

// :type
// :kind

function onCellUpdate(cm, instanceId) {
    elmDocument.chunks[instanceId] = [];
    cm.eachLine(function(handle) {
        if (isImport(handle.text)) {
            // FIXME: only if this import is known library
            elmDocument.imports = unique(elmDocument.imports.concat([ handle.text.slice(8) ]));
        } else if (handle.text.indexOf('import ') < 0) {
            elmDocument.chunks[instanceId].push(handle.text);
        }
    });
    compile(elmDocumentToFileContent(elmDocument));
    //console.log(elmDocument);
}

function addCell(target) {
    const cellId = cellCount;
    const codemirrorWrapper = document.createElement('div');
    const previewInstance = document.createElement('div');
    target.appendChild(codemirrorWrapper);
    target.appendChild(previewInstance);
    const codemirrorInstance = CodeMirror(codemirrorWrapper, codemirrorOptions);

    codemirrorInstance.on('keypress', (cm, event) => {
        if (event.keyCode == 13 && event.shiftKey) {
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
