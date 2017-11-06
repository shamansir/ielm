const ElmRepl = require('node-elm-repl');

const preludeTemplate = require('./prelude.template.js');
const viewerTemplate = require('./viewer.template.js');

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

  append(cellId, content) {
    this.imports[cellId] = []
    this.definitions[cellId] = [];
    this.chunks[cellId] = [];

    const sortedContent = this.blockReader.parse(content.split('\n'));

    this.imports[cellId] = sortedContent.imports;
    this.definitions[cellId] = sortedContent.definitions;
    this.chunks[cellId] = sortedContent.chunks;
  }

  getBlockCount(cellId) {
    return this.chunks[cellId] ? this.chunks[cellId].length : 0;
  }

  buildPreludeFor(cellId) {
    return preludeTemplate(cellId, this.imports, this.definitions[cellId], this.chunks[cellId]);
  }

  buildViewerFor(cellId, types) {
    return viewerTemplate(cellId, types, this.imports[cellId], this.chunks[cellId]);
  }

}

function isImport(line) {
  return line.indexOf('import ') == 0;
}

function isTypeDeclaration(line) {
  return (line.indexOf('type ') == 0) ||
         (line.match(/^\w+\s*:/) != null);
}

function isDefinition(line) {
  return (line.match(/^\w+\s*=/) != null) ||
         (line.indexOf('-- ') == 0) ||
         (line.indexOf('{- ') == 0); // FIXME: store comments separately
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
