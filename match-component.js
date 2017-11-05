const ElmRepl = require('node-elm-repl');

function match(type) {
    const stringifiedType = ElmRepl.stringify(type/*, stringifier*/);
    //console.log(type, stringifiedType);
    if (isSimpleType(stringifiedType)) return 'SimpleType';
    if (isHtmlType(stringifiedType)) return 'HtmlType';
    return 'UnknownType';
}

function isSimpleType(type) {
    return (type === 'String');
}

function isHtmlType(type) {
    return (type.indexOf('Html a') === (type.length - 6)) ||
           (type.indexOf('Html msg') === (type.length - 8));
}

module.exports = match;
