const unique = require('array-unique').immutable;

const ElmRepl = require('node-elm-repl');
const matchComponent = require('./match-component.js');

const INDENT = '    ';

class RevlDocument {

  constructor() {
    this.imports = []; // [Cell ID] -> [Import ID] -> [String]
    this.definitions = []; // [Cell ID] -> [Definition ID] -> [String]
    this.chunks = []; // [Cell ID] -> [Chunk ID] -> [String]

    this.blockReader = new BlockReader({
      imports: isImport,
      definitions: line => isDefinition(line) || isTypeDeclaration(line),
      chunks: line => !isImport(line) && !isDefinition(line) && !isTypeDeclaration(line)
    })
  }

  // :type
  // :kind

  append(cellId, content) {
    this.imports[cellId] = []
    this.definitions[cellId] = [];
    this.chunks[cellId] = [];

    const sortedContent = this.blockReader.parse(content.split('\n'));

    this.imports[cellId] = sortedContent.imports;
    this.definitions[cellId] = sortedContent.definitions;
    this.chunks[cellId] = sortedContent.chunks;
  }

  buildPreludeFor(cellId) {
    return [].concat(
        this.imports.map((blocks, cellId) =>
          blocks.map((lines, blockId) => lines.join('\n')).join('\n\n')
        )
      ).concat(
        [ '' ]
      ).concat(
        this.definitions[cellId].map((lines, blockId) => lines.join('\n'))
      ).concat(
        [ '' ]
      ).concat(
        this.chunks[cellId].map((lines, blockId) => {
          const varName = `chunk_${cellId}_${blockId}`;
          return "\n" + varName + ' =\n' + lines.map(line => INDENT + line).join('\n');
        })
      );
  }

  buildViewerFor(cellId, types) {
    const componentsByVar = types.reduce((map, current) => {
      map[current.name] = matchComponent(ElmRepl.stringify(current.value));
      return map;
    }, {});
    return [ 'import Prelude exposing (..)' ]
      .concat(
        [ '' ]
      ).concat(
        this.imports[cellId].map((lines, blockId) => lines.join('\n'))
      ).concat(
        [ '' ]
      ).concat(
        Object.keys(componentsByVar).map(key =>
          `import Component.${componentsByVar[key]} as ${componentsByVar[key]}`
        )
      ).concat(
        [ '' ]
      ).concat(
        this.chunks[cellId].map((lines, blockId) => {
          // types
          const varName = `chunk_${cellId}_${blockId}`;
          const component = componentsByVar[varName];
          return `\nt_${varName} =\n${INDENT}${component}.render "${varName}"`;
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
    let blockId = {}; // by ruleName
    const result = {};

    for (const ruleName of Object.keys(rules)) {
      blockId[ruleName] = 0;
      result[ruleName] = [];
    }

    for (const line of lines) {

      if (!currentRule && line.length) {
        for (const ruleName of Object.keys(rules)) {
          if (rules[ruleName](line)) {
            currentRule = ruleName;
            result[ruleName][blockId[ruleName]] = [];
            result[ruleName][blockId[ruleName]].push(line);
            break;
          }
        }
      } else if (currentRule) {
        result[currentRule][blockId[currentRule]].push(line);
        if (!line.length) {
          blockId[currentRule] += 1;
          currentRule = '';
        }
      }

    }

    return result;
  }

}

module.exports = RevlDocument;
