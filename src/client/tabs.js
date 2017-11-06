class Tabs {

  constructor(screenId) {
    this.screenId = screenId;
    this.elm = document.createElement('div');
    this.elm.className = 'tabpanel tabpanel--empty';
    this.tabs = {};
    this.addTab('screenId', `#${screenId}`, { background: 'black' });
    this.addTab('test', 'Test', { align: '97%', background: 'red' });
  }

  addTab(alias, content, options) {
    const tab = new Tab(options);
    tab.update(content);
    this.tabs[alias] = tab;
    this.elm.appendChild(tab.getElement());
    return tab;
  }

  changeTab(alias, content) {
    this.tabs[alias].update(content);
  }

  getElement() {
    return this.elm;
  }

}

class Tab {

  constructor(options) {
    this.elm = document.createElement('div');
    this.elm.className = 'tab';
    if (options.background) this.elm.style.backgroundColor = options.background;
    if (options.align) this.elm.style.left = options.align;
  }

  update(content) {
    this.elm.innerText = content;
  }

  getElement() {
    return this.elm;
  }

}

module.exports = Tabs;
