const ElmRepl = require('node-elm-repl');

function match(type) {
    if (isStringType(type)) return 'StringType';
    if (isStringCompatibleType(type)) return 'StringCompatibleType';
    if (isHtmlType(type)) return 'HtmlType';
    return 'UnknownType';
}

function isStringType(t) {
    return (t.type === 'type') && (t.def.name === 'String');
}

function isStringCompatibleType(t) {
    if ((t.type === 'var') && (t.name === 'number')) return true;
    return ((t.type === 'type') &&
            ((t.def.name === 'Int') ||
             (t.def.name === 'Float')));
}

function isHtmlType(t) {
    return (t.type === 'aliased') && (t.def.name === 'Html')
        //&& (t.def.user === 'elm-lang') && (t.def.package === 'html')
        && t.msgvar;
}

module.exports = match;
