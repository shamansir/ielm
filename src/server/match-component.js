// See https://github.com/shamansir/node-elm-repl/blob/master/Types.md for reference

var unique = require('array-unique').immutable;

function match(type) {
    if (isStringType(type)) {
        return component('string', 'StringType');
    }
    if (isStringCompatibleType(type)) {
        return component('stringable', 'StringCompatibleType');
    }
    if (isHtmlType(type)) {
        return component('html', 'HtmlType');
    }
    if (isListType(type)) {
        const itemComp = match(extractListItemType(type));
        return component('list', 'ListType', itemComp.requirements, itemComp);
    }
    if (isTupleType(type)) {
        const itemComponents = extractTupleItemTypes(type).map(match);
        const itemRequirements = itemComponents.map(
            (itemData) => itemData.requirements
        ).reduce( // a.k.a flatMap
            (allRequirements, itemRequirements) => allRequirements.concat(itemRequirements),
        []);
        return component(
            'tuple',
            'TupleType',
            itemRequirements,
            { arity: getTupleArity(type),
              items: itemComponents
            }
        );
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
            'record',
            'RecordType',
            fieldRequirements,
            fieldComponents
        );
    }
    if (mayBeViewedIn3d(type)) {
        return component(
            '3d',
            'ThreeDViewer',
            [],
            get3dSubType(type)
        );
    }
    return component('Unknown', 'UnknownType');
}

function component(alias, baseComponent, requirements, payload) {
    return {
        alias: alias,
        base: baseComponent,
        requirements: requirements
            ? unique([ baseComponent ].concat(requirements))
            : [ baseComponent ],
        payload: payload
    }
}

function isStringType(t) {
    return (t.type === 'type') && (t.def.name === 'String');
}

function isStringCompatibleType(t) {
    if ((t.type === 'var') && (t.name.indexOf('number') === 0)) return true;
    return ((t.type === 'type') &&
            ((t.def.name === 'Int') ||
             (t.def.name === 'Float') ||
             (t.def.name === 'Char')));
}

function isHtmlType(t) {
    return (t.type === 'aliased') && (t.def.name === 'Html')
        //&& (t.def.user === 'elm-lang') && (t.def.package === 'html')
        && t.msgvar;
}

function isListType(t) {
    return (t.type === 'app') && (t.subject.def.name === 'List');
}

function isTupleType(t) {
    return ((t.type === 'app') && (t.subject.def.name.indexOf('Tuple') === 1));
}

function mayBeViewedIn3d(t) {
    return ((t.type === 'app') && (t.subject.def.name === 'Mesh')) ||
           ((t.type === 'type') && (t.def.name === 'Entity'));
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

function extractTupleItemTypes(t) {
    return t.object;
}

function get3dSubType(t) {
    if (t.subject && t.subject.def && t.subject.def.name === 'Mesh') return 'mesh';
    if (t.def && t.def.name === 'Entity') return 'entity';
}

function getTupleArity(t) {
    return parseInt(t.subject.def.name.substring(6));
}

module.exports = match;
