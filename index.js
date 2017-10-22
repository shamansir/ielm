'use strict';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/monokai.css');
require('./index.css');

require('whatwg-fetch');

var unique = require('unique').immutable;
var Counter = require('./Counter.elm');
var mountNode = document.getElementById('elm-app');
var CodeMirror = require('codemirror');
require('codemirror/mode/elm/elm');

var instanceCount = 0;

var elmDocument = {
    imports: [],
    chunks: [] // array of arrays: CodeMirror instances to lines
};

var codemirrorOptions = {
    value: "foo = \"bar\"",
    mode:  "elm",
    lineNumbers: true,
    autofocus: true
};

function onInstanceUpdate(instanceId) {
    return function(cm) {
        elmDocument.chunks[instanceId] = [];
        cm.eachLine(function(handle) {
            if (handle.text.indexOf('import ') == 0) {
                // FIXME: only if this import is known library
                // elmDocument.imports = unique(elmDocument.imports.concat([ handle.text ]));
            } else {
                elmDocument.chunks[instanceId].push(handle.text);
            }
        });
        //console.log(elmDocument);
    }
}

function addInstance(target) {
    var instanceId = instanceCount;
    var codemirrorWrapper = document.createElement('div');
    var previewInstance = document.createElement('div');
    target.appendChild(codemirrorWrapper);
    target.appendChild(previewInstance);
    var codemirrorInstance = CodeMirror(codemirrorWrapper, codemirrorOptions);

    codemirrorInstance.on('change', onInstanceUpdate(instanceId));

    instanceCount++;
}

//document.addEventListener('DOMContentLoaded', function() {
    addInstance(document.body);
//});

// The third value on embed are the initial values for incomming ports into Elm
//var app = Counter.Main.embed(mountNode);

fetch('http://localhost:3000')
    .then(function(response) {
        return response.json()
    }).then(function(json) {
        console.log('parsed json', json)
    }).catch(function(ex) {
        console.log('parsing failed', ex)
    })
