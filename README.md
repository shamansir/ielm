# I, Elm.

[IElm — In action](https://vimeo.com/242822314), video @ vimeo.

## First run

Install Elm globally using `npm install -g elm`.

Run `ielm` and then open http://localhost:8080 in your browser.

Try entering code from [examples](./examples).

To compile, press Shift+Enter (Keystrokes could be changed or added in next versions).

You may use the local install as well, then run `node ./node_modules/ielm/cli.js` from your project directory.

If you have a copy of `iElm` from Github or elsewhere, you may provide a path to its directory with `path=/path/to/ielm`.

## Clean run

You may run `npm run clean-start` to force cleaning `elm-stuff` in the ouput directory and re-installing even those Elm packages which were already installed.

## Adding a package

Just install additional package to your project, as you usually do it with `elm-package install`.

## Development

The commands described above start the `simplehttpserver` to host the compiled `ielm.js`, so if you want to do some development, you need to start `webpack-dev-server` instead — so just go to the package directory and do `npm run dev-start`.

Adding `local` flag as a parameter allows you to start everything from the local directory instead of some external project. It is appended to `npm run dev-start` by default.

## Building `ielm.js`

Just execute `npm run build` in a package directory.

## CLI

* `npm start` is the same as doing `node ./cli.js run`.
* `npm run clean-start` is the same as doing `node ./cli.js clean-run`.
* `npm run dev-start` is the same as doing `node ./cli.js dev-run local`.
* `npm run clean-dev-start` is the same as doing `node ./cli.js clean-dev-run local`.
* `npm run build` is the same as doing `node ./cli.js build`.

## Terminology

* _Chunk_ is a callable line of Elm code, an expression; it is not allowed to define such expressions on the top level (i.e. w/o indentation) in a common Elm file, _but_ in case of IElm — it is the only way to actually evaluate this expression;
* _Screen_ combines two concepts in one: a block of code with Elm-style imports, Elm-style definitions and _"Chunks"_, and preview of this code, where all these _chunks_ are evaluated and could be observed and controlled;
* _Cell_ is the result of single _Chunk_ evaluation, i.e. the result of the expression;
