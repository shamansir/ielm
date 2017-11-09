class Tabs {

  constructor(screenId) {
    this.screenId = screenId;
    this.elm = document.createElement('div');
    this.elm.className = 'tabpanel tabpanel--empty';
    this.tabs = {};
    this.addTab('screenId', `#${screenId}`, { background: 'black' });
    this.addTab('status', 'Changed', { background: 'burlywood' });
  }

  addTab(alias, content, options) {
    this.elm.className = 'tabpanel';
    const tab = new Tab(options);
    tab.update(content);
    this.tabs[alias] = tab;
    this.elm.appendChild(tab.getElement());
    return tab;
  }

  informChanged() {
    this.changeTab('status', 'Changed', { background: 'burlywood' });
  }

  informCompiling() {
    this.changeTab('status', 'Compiling...', { background: 'crimson' });
  }

  informCompiled() {
    this.changeTab('status', 'Up-to-date', { background: 'deepskyblue' });
  }

  changeTab(alias, content, options) {
    this.tabs[alias].update(content, options);
  }

  getElement() {
    return this.elm;
  }

}

class Tab {

  constructor(options) {
    this.elm = document.createElement('div');
    this.elm.className = 'tab';
    this.applyOptions(options);
  }

  applyOptions(options) {
    if (options.background) this.elm.style.backgroundColor = options.background;
    if (options.align) this.elm.style.left = options.align;
  }

  update(content, options) {
    this.elm.innerText = content;
    if (options) this.applyOptions(options);
  }

  getElement() {
    return this.elm;
  }

}

module.exports = Tabs;
