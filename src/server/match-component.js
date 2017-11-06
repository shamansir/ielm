const ElmRepl = require('node-elm-repl');

function match(type) {
    const stringifiedType = ElmRepl.stringify(type/*, stringifier*/);
    //console.log(type, stringifiedType);
    if (isStringType(stringifiedType)) return 'StringType';
    if (isStringCompatibleType(stringifiedType)) return 'StringCompatibleType';
    if (isHtmlType(stringifiedType)) return 'HtmlType';
    return 'UnknownType';
}

function isStringType(type) {
    return (type === 'String');
}

function isStringCompatibleType(type) {
    return (type === 'number') ||
           (type === 'Int') ||
           (type === 'Float');
}

function isHtmlType(type) {
    return (type.indexOf('Html a') === (type.length - 6)) ||
           (type.indexOf('Html msg') === (type.length - 8));
}

module.exports = match;
