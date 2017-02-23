'use babel';
const HostView = require('./host-view');

module.exports =
class EditHostView {
  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('clearcase');

    this.mainview = new HostView();
    console.log(this.mainview.getElement());
    this.element.appendChild(this.mainview.getElement());

    this.btnConfirm = document.createElement('button');
    this.lbBtnConfirm = document.createTextNode('Confirm');
    this.btnConfirm.appendChild(this.lbBtnConfirm);
    this.btnConfirm.onclick = () => {this.onConfirm();};
    this.btnConfirm.classList.add('button');
    this.element.appendChild(this.btnConfirm);

    this.btnCancel = document.createElement('button');
    this.lbBtnCancel = document.createTextNode('Cancel');
    this.btnCancel.appendChild(this.lbBtnCancel);
    this.btnCancel.onclick = () => {this.onCancel();};
    this.btnCancel.classList.add('button');
    this.element.appendChild(this.btnCancel);

    this.panel = atom.workspace.addModalPanel({item: this.element, visible: false});
  }
  serialize() {}
  destroy() {
    this.element.remove();
  }
  getElement() {
    return this.element;
  }
  onConfirm() {
    console.log('EditHostView:onConfirm');
    console.log(this.mainview.getHostName());
  }
  onCancel() {
    console.log('EditHostView:onCancel');
    this.cancel();
  }
  cancel() {
    console.log('EditHostView:cancel');
    this.hide();
  }
  hide() {
    console.log('EditHostView:hide');
    this.panel.hide();
  }
  show() {
    console.log('EditHostView:show');
    this.panel.show();
    console.log('element:' + this.element);
  }

}
