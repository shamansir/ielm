class Preview {

  constructor(cellId) {
    this.cellId = cellId;
    this.elm = document.createElement('div');
    this.empty();
  }

  empty() {
    this.elm.className = 'preview preview--empty';
    this.elm.innerText = '<Empty>';
  }

  busy() {
    this.elm.className = 'preview preview--rendering';
    this.elm.innerText = '<Compiling...>';
  }

  update(json) {
    const cellId = this.cellId;
    this.elm.className = 'preview';
    this.elm.innerHTML = '';
    if (!json.error) {
      const Chunk = require('./build/Chunk' + cellId + '.js');
      if (!Chunk || !Chunk.Main) {
        this.error('Compiled Chunk file was not found or has no Main entry-point');
        return;
      }
      for (var blockId = 0; blockId < json.blockCount; blockId++) {
        const blockElm = document.createElement('div');
        Chunk.Main.embed(blockElm, blockId);
        this.elm.appendChild(blockElm);
      }
    } else {
      const codeElm = document.createElement('code');
      codeElm.innerText = json.error;
      this.elm.appendChild(codeElm);
    }
  }

  error(error) {
    this.elm.className = 'preview preview--error';
    this.elm.innerText = error;
  }

  getElement() {
    return this.elm;
  }

}

module.exports = Preview;
