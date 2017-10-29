const unique = require('array-unique').immutable;

class RevlDocument {

  constructor() {
    this.imports = []; // array of lines
    this.definitions = []; // array of arrays: Cell ID to lines
    this.chunks = []; // array of arrays: Cell ID to lines
  }

  append(cellId, content) {
    this.definitions[cellId] = [];
    this.chunks[cellId] = [];
    content.split('\n').forEach(line => {
      if (isImport(line)) {
          // FIXME: only if this import is known library
          this.imports = unique(this.imports.concat([ line.slice(8) ]));
      } else if (line.indexOf('import ') < 0) {
          this.chunks[cellId].push(line);
      }
    })
  }

  buildPreludeFor(cellId) {
    // FIXME: do not compile Prelude if definitions are empty
    if (!this.definitions[cellId].length) return [ 'foo = "bar"' ];
    return []
      .concat(
        this.imports
            .map((importBody) => 'import ' + importBody)
      )
      .concat([ '' ])
      .concat(
        this.definitions[cellId].map((lines) => lines.join('\n'))
      );
  }

  buildViewerFor(cellId) {
    return [ 'import Prelude exposing (..)' ]
      .concat(
        this.imports
            .map((importBody) => 'import ' + importBody)
      )
      .concat(
        this.chunks[cellId].map((line, index) => {
          const varName = 'chunk_' + index;
          return "\n" + varName + ' =\n    ' + line;
          /* return varName + ' = \n'
              + lines.map((line) => '    ' + line).join('\\n'); */
        })
      );
  }

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

module.exports = RevlDocument;
