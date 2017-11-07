const matchComponent = require('./match-component.js');
const adaptType = require('./adapt-type.js');

function screen(screenId, types, imports, chunks) {
  const componentsByVar = types.reduce((map, current) => {
    if (current.name.indexOf('cell_') == 0) {
      map[current.name] = matchComponent(current.value).requirements[0];
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
  Object.keys(componentsByVar).map(key =>
    `import Component.${componentsByVar[key]} as ${componentsByVar[key]}`
  ).join('\n')
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
        ${component}.render
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

module.exports = screen;

