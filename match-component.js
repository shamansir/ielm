const ElmRepl = require('node-elm-repl');

function stringifier() {

}

function match(type) {
    const stringifiedType = ElmRepl.stringify(type/*, stringifier*/);
    //console.log(type, stringifiedType);
    if (isSimpleType(stringifiedType)) return 'SimpleType';
    return 'UnknownType';
}

function isSimpleType(type) {
    return (type === 'String');
}

module.exports = match;
