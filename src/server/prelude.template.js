function prelude(screenId, allImports, allDefinitions, chunks) {
  return [ `module Prelude exposing (..)`, '' ].concat(
    allImports.map((cells, screenId) =>
      cells.map((lines, cellId) => lines.join('\n')).join('\n\n')
    )
  ).concat(
    [ '',
      'import Component.Cell exposing (raw)',
      '' ]
  ).concat(
    allDefinitions.map((cells, screenId) =>
      cells.map(
        (lines, cellId) => `{- Screen ${screenId} -}\n\n${lines.join('\n')}`
      ).join('\n\n')
    )
  ).concat(
    [ '' ]
  ).concat(
    chunks.map((lines, cellId) => {
      return `{- Screen ${screenId}, Cell ${cellId} -}

cell_${screenId}_${cellId} =
${
  lines.map(line => `   ${line}`).join('\n')
}
  `
    })
  ).join('\n')
}

module.exports = prelude;
