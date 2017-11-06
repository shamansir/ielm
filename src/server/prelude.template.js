function prelude(cellId, allImports, definitions, chunks) {
  return [].concat(
    allImports.map((blocks, cellId) =>
      blocks.map((lines, blockId) => lines.join('\n')).join('\n\n')
    )
  ).concat(
    [ '' ]
  ).concat(
    definitions.map((lines, blockId) => lines.join('\n'))
  ).concat(
    [ '' ]
  ).concat(
    chunks.map((lines, blockId) => {
      return `chunk_${cellId}_${blockId} =
${
  lines.map(line => `   ${line}`).join('\n')
}
  `
    })
  )
}

module.exports = prelude;
