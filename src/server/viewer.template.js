const matchComponent = require('./match-component.js');
const adaptType = require('./adapt-type.js');

function viewer(cellId, types, imports, chunks) {
  const componentsByVar = types.reduce((map, current) => {
    if (current.name.indexOf('chunk_') == 0) {
      map[current.name] = matchComponent(current.value);
    }
    return map;
  }, {});
  const typesByVar = types.reduce((map, current) => {
    if (current.name.indexOf('chunk_') == 0) {
      map[current.name] = adaptType(current.value);
    }
    return map;
  }, {});
  return `
import Html exposing (..)
import Prelude exposing (..)

${ imports.map((lines, blockId) => lines.join('\n')).join('\n') }

import Component.Cell as Cell
import Component.TypeType exposing (TypeAtom(..))

${
  Object.keys(componentsByVar).map(key =>
    `import Component.${componentsByVar[key]} as ${componentsByVar[key]}`
  ).join('\n')
}

type alias Model = Int

view : Model -> Html a
view varIndex =
    case varIndex of
${
  chunks.map((lines, blockId) => {
    const varName = `chunk_${cellId}_${blockId}`;
    return `        ${blockId} -> t_${varName}`;
  }).join('\n')
}
        _ -> div [] [ text "Unknown chunk type" ]

${
  chunks.map((lines, blockId) => {
    const varName = `chunk_${cellId}_${blockId}`;
    const component = componentsByVar[varName];
    const adaptedType = typesByVar[varName];
    return `t_${varName} =
    ${varName} |> Cell.render
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

module.exports = viewer;

