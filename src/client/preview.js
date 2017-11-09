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

  update(json, screenElmModule) {
    const cellId = this.cellId;
    this.elm.className = 'preview';
    this.elm.innerHTML = '';
    if (!json.error) {
      if (!screenElmModule || !screenElmModule.embed) {
        this.error('Compiled Screen file was not found or has no Main entry-point');
        return;
      }
      for (let cellId = 0; cellId < json.cellCount; cellId++) {
        const cellElm = document.createElement('div');
        this.elm.appendChild(cellElm);
        const embeddedCell = screenElmModule.embed(cellElm, { cellId });
        setTimeout(() => {
          embeddedCell.ports.setRefPosition.send({ x: cellElm.offsetLeft, y: cellElm.offsetTop });
        }, 1);
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
