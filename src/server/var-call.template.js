function varCall(varName, typeDef, component) {
    if (component.alias !== '3d') {
        return `t_${varName} =
    ${varName} |> Cell.renderBasic
        ${getRenderCallFor(component, varName)}
        ${typeDef}`;
    } else if (component.alias === '3d') {
        return `t_${varName} position =
    ${varName} |> Cell.${getRender3DCallFor(component)}
        position
        ${typeDef}`;
    }
}

function getRender3DCallFor(component) {
    if (component.payload === 'mesh') {
        return 'render3dMeshAt';
    } else if (component.payload === 'entity') {
        return 'renderEntityAt';
    } else {
        return 'renderBasic';
    }
}

const I3 = '            '; // three indentations
const I4 = '                '; // four indentations

function getRenderCallFor(component, varName) {
    if ((component.alias === 'list') || (component.alias === 'array')) {
        return `(${component.base}.render (${getRenderCallFor(component.payload, varName)}))`;
    } else if (component.alias === 'tuple') {
        return `(${component.base}.render${component.payload.arity}
        ( (${component.payload.items.map((item) => getRenderCallFor(item, varName)).join('), (')}) ))`;
    } else if (component.alias === 'record') {
        const fields = component.payload;
        return `(\\_ -> ${component.base}.render
${I3}(Array.fromList [ "${ fields.map((fieldData) => fieldData.name).join('", "') }" ])
${I3}(\\idx -> case idx of
${ fields.map((fieldData, index) =>
    `${I4}${index} -> ${getRenderCallFor(fieldData.comp, varName)} (.${fieldData.name} ${varName})`)
        .join('\n')
}
${I4}_ -> Cell.renderError "Unknown record field"
${I3}))`;
    } else if (component.alias === 'alias') {
        const aliasName = component.payload.name;
        const comp = component.payload.comp;
        return `(${component.base}.render "${aliasName}" (${getRenderCallFor(comp, varName)}))`;
    } else {
        return `${component.base}.render`;
    }
}

module.exports = varCall;

