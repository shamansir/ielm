const matchComponent = require('./match-component.js');
const adaptType = require('./adapt-type.js');
const makeVarCall = require('./var-call.template.js');

//const util = require('util');

function screen(screenId, moduleName, allTypes, imports, chunks) {
  //console.log(util.inspect(allTypes, { showHidden: false, depth: null }));
  const componentsByVar = allTypes.reduce((map, current) => {
    if (current.name.indexOf('cell_') == 0) {
      map[current.name] = matchComponent(current.value);
    }
    return map;
  }, {});
  const typesByVar = allTypes.reduce((map, current) => {
    if (current.name.indexOf('cell_') == 0) {
      map[current.name] = adaptType(current.value);
    }
    return map;
  }, {});
  return `
port module ${moduleName} exposing (..)

import Array
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
view { cellId, position, inputs } =
    case cellId of
${
  chunks.map((lines, cellId) => {
    const varName = `cell_${screenId}_${cellId}`;
    const component = componentsByVar[varName];
    if (component.alias === '3d') {
      return `        ${cellId} -> t_${varName} position`;
    } else if (component.alias === 'controls') {
      return `        ${cellId} -> t_${varName} inputs`;
    } else {
      return `        ${cellId} -> t_${varName}`;
    }
  }).join('\n')
}
        _ -> Cell.renderError "Unknown cell type"

${
  chunks.map((lines, cellId) => {
    const varName = `cell_${screenId}_${cellId}`;
    const component = componentsByVar[varName];
    const adaptedType = typesByVar[varName];
    return makeVarCall(varName, adaptedType, component);
  }).join('\n\n')
}

addInputs : Screen.Flags -> ( Screen.Model, Cmd Cell.Action ) -> ( Screen.Model, Cmd Cell.Action )
addInputs { cellId } payload =
${
  (() => {
    const inputsByCell = chunks.reduce((inputs, _, cellId) => {
      const varName = `cell_${screenId}_${cellId}`;
      const component = componentsByVar[varName];
      if (component.alias === 'controls') {
        inputs[cellId] = component;
      }
      return inputs;
    }, {});
    const initialValues = Object.keys(inputsByCell).reduce((values, cellId) => {
      const comp = inputsByCell[cellId];
      const defaults = comp.payload.inputDefaults;
      values[cellId] = `[ ${comp.payload.inputs.map((input) => `Cell.${input} ${defaults[input]}`).join(', ') } ]`;
      return values;
    }, {});
    // if there are inputs
    if (Object.keys(inputsByCell).length > 0) { return `
    Screen.addInputs
        (case cellId of
${ Object.keys(inputsByCell).map((cellId) => {
  return `            ${cellId} -> ${initialValues[cellId]}`;
}).join('\n') }
            _ -> []
        )
        payload`
    // if there are none
    } else { return `    payload`
    };
  })()
}

port setRefPosition : ({ x: Int, y: Int } -> x) -> Sub x

subscribe = \\model -> Sub.batch (Screen.subscribe model ++ [ setRefPosition Cell.SetRefPosition ])

main =
    programWithFlags
        { init = (\\cellId -> cellId |> Screen.init |> (addInputs cellId))
        , update = Screen.update
        , subscriptions = subscribe
        , view = view
        }
`
}

module.exports = screen;

