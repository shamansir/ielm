'use strict';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/monokai.css');

require('whatwg-fetch');

var Counter = require('./Counter.elm');
var mountNode = document.getElementById('elm-app');
var Codemirror = require('codemirror');
require('codemirror/mode/elm/elm');

console.log(Codemirror);

// The third value on embed are the initial values for incomming ports into Elm
var app = Counter.Main.embed(mountNode);

fetch('http://localhost:3000')
    .then(function(response) {
        return response.json()
    }).then(function(json) {
        console.log('parsed json', json)
    }).catch(function(ex) {
        console.log('parsing failed', ex)
    })
