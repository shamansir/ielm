// See https://github.com/shamansir/node-elm-repl/blob/master/Types.md as a reference

function stringify(t) {
    if (t.type == 'type') return `(Name "${t.def.name}")`;
    if (t.type == 'var') return `(Variable "${t.name}")`;
    if (t.type == 'lambda') return `(Lambda ${stringify(t.left)} ${stringify(t.right)})`;
    if (t.type == 'app') return `(Application ${stringify(t.subject)} [ ${t.object.map(stringifier).join(', ')} ])`;
    if (t.type == 'aliased') return `(Alias ${stringify(t.subject)} [ ${t.object.map(stringifier).join(', ')} ])`;
    if (t.type == 'record') return `(Record [ ${t.fields.map(stringifyField).join(', ')} ])`;
}

function stringifyField(f) {
    return `( "${f.name}", ${stringify(f.node)} )`;
}

module.exports = stringify;
