function varCall(varName, typeDef, component) {
    if (component.alias !== '3d') {
        return `t_${varName} =
    ${varName} |> Cell.renderBasic
        ${getRenderCallFor(component)}
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


function getRenderCallFor(component) {
    if (component.alias === 'list') {
        return `(${component.base}.render (${getRenderCallFor(component.payload)}))`;
    } else if (component.alias === 'tuple') {
        return `(${component.base}.render${component.payload.arity}
        ( (${component.payload.items.map(getRenderCallFor).join('), (')}) ))`;
    } else if (component.alias === 'record') {
        return `${component.base}.render (\\_ -> span [ ] [ text "N/A" ])`; // TODO
    } else {
        return `${component.base}.render`;
    }
}

module.exports = varCall;

