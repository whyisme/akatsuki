'use strict';
module.exports =
class ClearCaseServerView {
  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('clearcase');

    this.message = document.createElement('div');
    this.message.textContent = "Message Here!";
    this.message.classList.add('message');
    this.element.appendChild(this.message);

    this.btnConfirm = document.createElement('button');
    this.lbBtnConfirm = document.createTextNode('Confirm');
    this.btnConfirm.appendChild(this.lbBtnConfirm);
    console.log('btnConfirm:' + Object.keys(this.btnConfirm));
    this.btnConfirm.onclick = () => {this.onConfirm();};
    this.btnConfirm.classList.add('button');
    this.element.appendChild(this.btnConfirm);

    this.panel = atom.workspace.addModalPanel({item: this.element, visible: false});

    atom.commands.add('atom-workspace', {
      'core:confirm1': () => {
        this.onConfirm();
      }
    });
  }
  serialize() {}
  destroy() {
    this.element.remove();
  }
  getElement() {
    return this.element;
  }
  onConfirm() {
    console.log('CCSV:onConfirm');
    this.cancel();
  }
  cancel() {
    console.log('CCSV:cancel');
    this.hide();
  }
  hide() {
    console.log('CCSV:hide');
    this.panel.hide();
  }
  show() {
    console.log('CCSV:show');
    this.panel.show();
  }
}
