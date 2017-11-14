# I, Elm.

[IElm — In action](https://vimeo.com/242822314), a video at vimeo.

## First run

Install Elm globally using `npm install -g elm`, then run `npm install` in this direcory.

Run `npm start` and then open http://localhost:8080 in your browser.

Try entering code from [examples]('./tree/master/examples').

## All the subsequent runs

You may run `npm run quick-start` every next time instead of `npm start`, it is a way to avoid cleaning `elm-stuff` and re-installing the Elm packages which were already installed.

## Adding a package

For the moment, `iElm` puts everything into `build` directory, later I will change the logic to make it work from your project (like `elm-reactor`) so you'll be able to import all the packages used in your project. For now, change `src/server/elm-package.sample.json` to add wanted package.

## Terminology

* _Chunk_ is a callable line of Elm code, an expression; it is not allowed to define such expressions on the top level (i.e. w/o indentation) of a common Elm file, but in case of iElm — it is the only way to actually evaluate this expression;
* _Screen_ combines two concepts in one: a block of code with Elm-style imports, Elm-style definitions and _"Chunks"_, and preview of this code, where all these _chunks_ are evaluated and could be observed and controlled;
* _Cell_ is the result of single _Chunk_ evaluation, i.e. the result of the expression;
