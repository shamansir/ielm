# iElm

Run `npm start` and then open http://localhost:3000 in your browser

You may run `npm run quick-start` every next time instead of `npm start`, it is a way to avoid cleaning `elm-stuff` and re-installing the Elm packages which were already installed.

## Terminology

* _Chunk_ is a callable line of Elm code, an expression; it is not allowed to define such expressions on the top level (i.e. w/o indentation) of a common Elm file, but in case of iElm — it is the only way to actually evaluate this expression;
* _Screen_ combines two concepts in one: a block of code with Elm-style imports, Elm-style definitions and _"Chunks"_, and preview of this code, where all these _chunks_ are evaluated and could be observed and controlled;
* _Cell_ is the result of single _Chunk_ evaluation, i.e. the result of the expression;
