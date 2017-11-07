// See https://github.com/shamansir/node-elm-repl/blob/master/Types.md for reference

function stringify(t) {
    if (t.type == 'type') return `(Name "${t.def.name}")`;
    if (t.type == 'var') return `(Variable "${t.name}")`;
    if (t.type == 'lambda') return `(Lambda ${stringify(t.left)} ${stringify(t.right)})`;
    if (t.type == 'app') return `(Application ${stringify(t.subject)} [ ${t.object.map(stringify).join(', ')} ])`;
    if (t.type == 'aliased') {
        if (t.msgvar) return `(MessageAlias "${t.def.name}" "${t.msgvar}")`;
        return `(Alias "${t.def.name}" [ ${t.list.map(stringify).join(', ')} ])`;
    }
    if (t.type == 'record') return `(Record [ ${t.fields.map(stringifyField).join(', ')} ])`;
}

function stringifyField(f) {
    return `( "${f.name}", ${stringify(f.node)} )`;
}

module.exports = stringify;
