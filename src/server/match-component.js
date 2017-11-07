// See https://github.com/shamansir/node-elm-repl/blob/master/Types.md for reference

function match(type) {
    if (isStringType(type)) {
        return component('String', [ 'StringType' ]);
    }
    if (isStringCompatibleType(type)) {
        return component('StringCompatible', [ 'StringCompatibleType' ]);
    }
    if (isHtmlType(type)) {
        return component('Html', [ 'HtmlType' ]);
    }
    if (isListType(type)) {
        const itemComp = match(extractListItemType(type));
        return component('List', [ 'ListType' ].concat(itemComp.requirements), itemComp);
    }
    if (isRecordType(type)) {
        const fieldData = extractRecordFieldData(type);
        const fieldComponents = fieldData.map((fieldData) => {
            return {
                name: fieldData.name,
                comp: match(fieldData.node)
            };
        });
        const fieldRequirements = fieldComponents.map(
            (fieldData) => fieldData.comp.requirements
        ).reduce( // a.k.a flatMap
            (allRequirements, fieldRequirements) => allRequirements.concat(fieldRequirements),
        []);
        return component(
            'Record',
            [ 'RecordType' ].concat(fieldRequirements),
            fieldComponents
        );
    }
    return component('Unknown', [ 'UnknownType' ]);
}

function component(alias, componentList, payload) {
    return {
        alias: alias,
        requirements: componentList,
        payload: payload
    }
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

function isListType(t) {
    return (t.type === 'app') && (t.subject.def.name === 'List');
}

function extractListItemType(t) {
    return t.object[0];
}

function isRecordType(t) {
    return (t.type === 'aliased') && !t.msgvar && t.list.length && (t.list[0].type === 'record');
}

function extractRecordFieldData(t) {
    return t.list[0].fields;
}

module.exports = match;
