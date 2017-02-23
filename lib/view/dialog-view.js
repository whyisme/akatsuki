'use babel';
const FilesView = require('./files-view');

module.exports =
class DialogView {
  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('clearcase');

    this.message = document.createElement('div');
    this.message.textContent = "Message Here!";
    this.message.classList.add('message');
    this.element.appendChild(this.message);

    this.listview = new FilesView();
    this.listview.setItems(['row 1', 'row 2']);
    console.log(this.listview.getElement());
    this.element.appendChild(this.listview.getElement());

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
    console.log('CCSV:onConfirm');
    this.message.textContent = this.message.textContent + ' confirmed!'
    //this.cancel();
  }
  onCancel() {
    console.log('CCSV:onCancel');
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
  setContent(content) {
    this.message.textContent = content;
  }
  setItems(items) {
    this.listview.setItems(items);
  }
  setHost(host) {
    this.listview.setHost(host);
  }
}
