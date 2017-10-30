const unique = require('array-unique').immutable;

class RevlDocument {

  constructor() {
    this.imports = []; // array of lines
    this.definitions = []; // array of arrays: Cell ID to lines
    this.chunks = []; // array of arrays: Cell ID to lines

    this.blockReader = new BlockReader({
      imports: isImport,
      definitions: line => isDefinition(line) || isTypeDeclaration(line),
      chunks: line => !isImport(line) && !isDefinition(line) && !isTypeDeclaration(line)
    })
  }

  // :type
  // :kind

  append(cellId, content) {
    this.definitions[cellId] = [];
    this.chunks[cellId] = [];

    const sortedContent = this.blockReader.parse(content.split('\n'));

    console.log(sortedContent);

    this.imports = this.imports.concat(sortedContent.imports.map(line => line.slice(8)));
    this.definitions[cellId] = sortedContent.definitions;
    this.chunks[cellId] = sortedContent.chunks;

    /* let inDefinition = false;
    let inChunk = false;
    let currentDefinition = '';

    .forEach(line => {
      if (isImport(line)) {
        // FIXME: only if this import is known library
        this.imports = unique(this.imports.concat([ line.slice(8) ]));
      } else if (!inChunk && !inDefinition && (isTypeDeclaration(line) || isDefinition(line))) {
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
    }) */
  }

  buildPreludeFor(cellId) {
    return this.imports
      .map(
        importBody => 'import ' + importBody
      ).concat(
        [ '' ]
      ).concat(
        this.definitions.map(cellDefs => cellDefs.join('\n'))
      ).concat(
        [ '' ]
      ).concat(
        this.chunks[cellId].map((line, index) => {
          const varName = 'chunk_' + cellId + '_' + index;
          return "\n" + varName + ' =\n    ' + line;
        })

        /*
        this.chunks.map((cellChunks, cellId) =>
          cellChunks.map((lines, index) => {
            const varName = 'chunk_' + cellId + '_' + index;
            return "\n" + varName + ' =\n    ' + lines.join('\n');
            // return varName + ' = \n'
            //     + lines.map((line) => '    ' + line).join('\\n');
          })
        ) */
      )
  }

  buildViewerFor(cellId, types) {
    return [ 'import Prelude exposing (..)' ]
      .concat(
        this.imports
            .map((importBody) => 'import ' + importBody)
      ).concat(
        [ '' ]
      ).concat(
        this.chunks[cellId].map((line, index) => {
          const varName = 'test_' + cellId + '_' + index;
          return "\n" + varName + ' =\n    ' + line;
          // types
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

class BlockReader {

  constructor(rules) {
    this.rules = rules;
  }

  parse(lines) {
    const rules = this.rules;
    let currentRule = '';
    const result = {};

    for (const ruleName of Object.keys(rules)) {
      result[ruleName] = [];
    }

    for (const line of lines) {

      if (!currentRule && line.length) {
        for (const ruleName of Object.keys(rules)) {
          if (rules[ruleName](line)) {
            currentRule = ruleName;
            result[ruleName].push(line);
            break;
          }
        }
      } else if (currentRule && line.length) {
        result[currentRule].push(line);
      } else if (currentRule && !line.length) {
        result[currentRule].push(line);
        currentRule = '';
      }

    }

    return result;
  }

}

module.exports = RevlDocument;
