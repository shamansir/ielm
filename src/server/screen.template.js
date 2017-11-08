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
import Prelude exposing (..)

${ imports.map((lines, cellId) => lines.join('\n')).join('\n') }

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

type alias Model = Int

view : Model -> Html Cell.Action
view cellId =
    case cellId of
${
  chunks.map((lines, cellId) => {
    const varName = `cell_${screenId}_${cellId}`;
    return `        ${cellId} -> t_${varName}`;
  }).join('\n')
}
        _ -> div [] [ text "Unknown cell type" ]

${
  chunks.map((lines, cellId) => {
    const varName = `cell_${screenId}_${cellId}`;
    const component = componentsByVar[varName];
    const adaptedType = typesByVar[varName];
    return `t_${varName} =
    ${varName} |> Cell.renderBasic
        ${getRenderCallFor(component)}
        ${adaptedType}`;
  }).join('\n\n')
}

main =
    programWithFlags
        { init = \\flags -> (flags, Cmd.none)
        , update = \\_ model -> (model, Cmd.none)
        , subscriptions = \\_ -> Sub.none
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

