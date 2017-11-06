function prelude(screenId, allImports, definitions, chunks) {
  return [].concat(
    allImports.map((cells, screenId) =>
      cells.map((lines, cellId) => lines.join('\n')).join('\n\n')
    )
  ).concat(
    [ '' ]
  ).concat(
    definitions.map((lines, cellId) => lines.join('\n'))
  ).concat(
    [ '' ]
  ).concat(
    chunks.map((lines, cellId) => {
      return `cell_${screenId}_${cellId} =
${
  lines.map(line => `   ${line}`).join('\n')
}
  `
    })
  )
}

module.exports = prelude;
