'use strict';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/monokai.css');
require('./index.css');

require('whatwg-fetch');

var Counter = require('./Counter.elm');
var mountNode = document.getElementById('elm-app');
var CodeMirror = require('codemirror');
require('codemirror/mode/elm/elm');

var instanceCount = 0;

function addInstance(target) {
    console.log('adding');
    var codemirrorWrapper = document.createElement('div');
    var previewInstance = document.createElement('div');
    target.appendChild(codemirrorWrapper);
    target.appendChild(previewInstance);
    var codemirrorInstance = CodeMirror(codemirrorWrapper, {
        value: "foo = \"bar\"",
        mode:  "elm"
    });
    codemirrorWrapper.focus();
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
