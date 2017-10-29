const unique = require('array-unique').immutable;

class RevlDocument {

  constructor() {
    this.imports = []; // array of lines
    this.definitions = []; // array of arrays: Cell ID to lines
    this.chunks = []; // array of arrays: Cell ID to lines
  }

  // :type
  // :kind

  append(cellId, content) {
    this.definitions[cellId] = [];
    this.chunks[cellId] = [];

    let inDefinition = false;
    let currentDefinition = '';

    content.split('\n').forEach(line => {
      if (isImport(line)) {
        // FIXME: only if this import is known library
        this.imports = unique(this.imports.concat([ line.slice(8) ]));
      } else if (!inDefinition && (isTypeDeclaration(line) || isDefinition(line))) {
        inDefinition = true;
        this.definitions[cellId].push(line);
      } else if (inDefinition) {
        if (line.length == 0) {
          this.definitions[cellId].push('');
          inDefinition = false;
        } else {
          this.definitions[cellId].push(line);
        }
      } else {
        this.chunks[cellId].push(line);
      }
    })
  }

  buildPreludeFor(cellId) {
    // FIXME: do not compile Prelude if definitions are empty
    const allDefinitions = this.definitions.map(cellDefs => cellDefs.join('\n'));
    const hasDefinitions = allDefinitions.join('\n').length > 0;
    return this.imports
      .map(
        importBody => 'import ' + importBody
      ).concat(
        [ '' ]
      ).concat(
        hasDefinitions ? allDefinitions : [ 'foo = "bar"' ]
      )
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
  return line.match(/^\w+\s*:/) != null;
}

function isDefinition(line) {
  return line.match(/^\w+\s*=/) != null;
}

module.exports = RevlDocument;
