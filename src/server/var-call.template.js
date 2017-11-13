const inputsDefaults = {
    'IInteger': '0',
    'IFloat': '0.0',
    'IText': '"test"'
}

function varCall(varName, typeDef, component) {
    // 3d
    if (component.alias === '3d') {
        return `t_${varName} position =
    ${varName} |> Cell.${getRender3DCallFor(component)}
        position
        ${typeDef}`;
    // controls
    } else if (component.alias === 'controls') {
        const inputs = component.payload.inputs;
        const inputVars = Array(inputs.length).fill().map((_, i) => `v${i}`).join(' ');
        const inputMatch = `[ ${ inputs.map((input, i) => `Cell.${input} v${i}`).join(', ') } ]`;
        return `t_${varName} inputs =
    ${varName} |> Cell.renderControllable
        (\\inputs v ->
            case (Array.toList inputs) of
                ${inputMatch} -> (v ${inputVars}) |> (${ getRenderCallFor(component.payload.comp, varName) })
                _ -> Cell.renderError "Failed to calculate")
        (inputs |> Maybe.withDefault
            (Array.fromList [ ${
                inputs.map((input) => `Cell.${input} ${inputsDefaults[input]}`).join(', ')
            } ])
        )
        ${typeDef}`;
    // others
    } else {
        return `t_${varName} =
        ${varName} |> Cell.renderBasic
            ${getRenderCallFor(component, varName)}
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
    `${I2}${index} -> \n${I3}${getRenderCallFor(fieldData.comp, varName, I3)} (.${fieldData.name} v)`)
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
    // var
    } else if (component.alias === 'var') {
        return `${component.base}.render "${component.payload}"`;
    // app
    } else if (component.alias === 'app') {
        const appName = component.payload.name;
        const objects = component.payload.objects;
        const objectCount = objects.length;
        // Maybe
        if (appName === 'Maybe') {
            return `(\\v -> ${component.base}.renderMaybe (${getRenderCallFor(objects[0], varName, I0)}) v)`;
        // Result
        } else if (appName === 'Result') {
            return `(\\v -> ${component.base}.renderResult (${getRenderCallFor(objects[0], varName, I0)}) (${getRenderCallFor(objects[1], varName, I0)}) v)`;
        // others
        } else {
            const objectVars = Array(objectCount).fill().map((_, i) => `v${i}`);
            return `(${component.base}.render "${appName}"
${I0}(\\v -> case v of
${I1}${appName} ${ objectVars.join(' ') } -> [ ${
    objects.map((obj, index) => `${I2}(${getRenderCallFor(obj, varName, I2)} ${objectVars[index]})`).join(`\n${I2}, `)
}
${I2}]))`;
        }
    // others
    } else {
        return `${component.base}.render`;
    }
}

module.exports = varCall;

