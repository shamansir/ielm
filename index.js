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

const previews = []; // Cell ID to Preview Element

function elmDocumentToFileContent(elmDoc) {
    return elmDoc.imports.map((importBody) => 'import ' + importBody)
        .concat(elmDoc.chunks.map((lines, index) => lines.join('\n')))
        .join('\n');
}

function compile(elmFileContent) {
    return fetch('http://localhost:3000/compile', {
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
    compile(elmDocumentToFileContent(elmDocument)).then(function(json) {
        renderResponse(previews[instanceId], json);
        console.log('parsed json', json);
    }).catch(function(ex) {
        console.log('parsing failed', ex);
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
