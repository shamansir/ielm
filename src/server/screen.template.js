const matchComponent = require('./match-component.js');
const adaptType = require('./adapt-type.js');

function screen(screenId, types, imports, chunks) {
  const componentsByVar = types.reduce((map, current) => {
    if (current.name.indexOf('cell_') == 0) {
      map[current.name] = matchComponent(current.value);
    }
    return map;
  }, {});
  const typesByVar = types.reduce((map, current) => {
    if (current.name.indexOf('cell_') == 0) {
      map[current.name] = adaptType(current.value);
    }
    return map;
  }, {});
  return `
import Html exposing (..)

${ imports.map((lines, cellId) => lines.join('\n')).join('\n') }

import Prelude exposing (..)
import Component.Screen as Screen
import Component.Cell as Cell
import Component.TypeType exposing (TypeAtom(..))

${
  Object.keys(componentsByVar).map(varName => {
    const component = componentsByVar[varName];
    return component.requirements.map((requirement) =>
      `import Component.${requirement} as ${requirement}`
    ).join('\n');
  }).join('\n')
}

view : Screen.Model -> Html Cell.Action
view { cellId, position } =
    case cellId of
${
  chunks.map((lines, cellId) => {
    const varName = `cell_${screenId}_${cellId}`;
    const component = componentsByVar[varName];
    if (component.alias !== '3d') {
      return `        ${cellId} -> t_${varName}`;
    } else {
      return `        ${cellId} -> t_${varName} position`;
    }
  }).join('\n')
}
        _ -> div [] [ text "Unknown cell type" ]

${
  chunks.map((lines, cellId) => {
    const varName = `cell_${screenId}_${cellId}`;
    const component = componentsByVar[varName];
    const adaptedType = typesByVar[varName];
    if (component.alias !== '3d') {
      return `t_${varName} =
    ${varName} |> Cell.renderBasic
      ${getRenderCallFor(component)}
      ${adaptedType}`;
    } else {
      return `t_${varName} position =
     ${varName} |> Cell.render3d
        position
        ${adaptedType}`;
    }
  }).join('\n\n')
}

main =
    programWithFlags
        { init = Screen.init
        , update = Screen.update
        , subscriptions = Screen.subscribe
        , view = view
        }
`.split('\n')
}

function getRenderCallFor(component) {
  if (component.alias === 'list') {
    return `(${component.base}.render (${getRenderCallFor(component.payload)}))`;
  } else if (component.alias === 'record') {
    return `${component.base}.render (\\_ -> span [ ] [ text "N/A" ])`; // TODO
  } else {
    return `${component.base}.render`;
  }
}

module.exports = screen;

