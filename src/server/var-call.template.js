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

function getRenderCallFor(component, varName, indent) {
    const I0 = indent || '            ';
    const I1 = I0 + '    ';
    const I2 = I1 + '    ';
    const I3 = I2 + '    ';
    // list & array
    if ((component.alias === 'list') || (component.alias === 'array')) {
        return `(${component.base}.render\n${I0}( ${getRenderCallFor(component.payload, varName, I0)}\n${I0}))`;
    // tuple
    } else if (component.alias === 'tuple') {
        return `(${component.base}.render${component.payload.arity}
${I0}(( ${component.payload.items.map((item) =>
    getRenderCallFor(item, varName, I0)).join(`)\n${I0}, (`)}) \n${I0}))`;
    // record
    } else if (component.alias === 'record') {
        const fields = component.payload;
        return `(\\v -> ${component.base}.render
${I1}(Array.fromList [ "${ fields.map((fieldData) => fieldData.name).join('", "') }" ])
${I1}(\\idx -> case idx of
${ fields.map((fieldData, index) =>
    `${I2}${index} -> \n${I3}${getRenderCallFor(fieldData.comp, varName, I3)} (.${fieldData.name} ${varName})`)
        .join('\n')
}
${I2}_ -> Cell.renderError "Unknown record field"
${I1}))`;
    // alias
    } else if (component.alias === 'alias') {
        const aliasName = component.payload.name;
        const comp = component.payload.comp;
        return `(${component.base}.render "${aliasName}"
${I0}(${getRenderCallFor(comp, varName, I1)}\n${I0}))`;
    // app
    } else if (component.alias === 'app') {
        const appName = component.payload.name;
        const objectCount = component.payload.objects.length;
        return `(${component.base}.render "${appName}" ${objectCount}
${I0}(\\idx -> case idx of
${ component.payload.objects.map(
    (obj, index) => `${I1}${index} -> \n${I2}(${getRenderCallFor(obj, varName, I2)})` ).join('\n') }
${I1}_ -> Cell.renderError "Unknown record field"
${I0}))`;
    // others
    } else {
        return `${component.base}.render`;
    }
}

module.exports = varCall;

