'use babel';

module.exports =
class DialogView {
  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('native-key-bindings');
  }

  serialize() {}
  destroy() {
    this.element.remove();
  }
  getElement() {
    return this.element;
  }
  onConfirm() {
    this.hide();
  }
  onCancel() {
    this.hide();
  }
  hide() {
    if (this.panel) {
      this.panel.hide();
      this.panel.destroy();
      console.log(this.panel);
      console.log(this.element);
    }
  }
  show() {
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({item: this.element, visible:false});
      this.panel.show();
    }
  }
  createLabelAndInput(inputID, placeHolder, labelText) {
    let div = document.createElement('div');
    div.classList.add('block');

    let label = document.createElement('label');
    label.setAttribute('for', inputID);
    label.textContent = labelText;
    div.appendChild(label);

    let input = document.createElement('input');
    input.classList.add('input-text');
    input.setAttribute('type', 'text');
    input.setAttribute('id', inputID);
    input.setAttribute('placeholder', placeHolder);
    div.appendChild(input);

    return div;
  }
  setValueById(id, value) {
    this.element.querySelector('#' + id).value = value;
  }
  getValueById(id) {
    let ele = this.element.querySelector('#' + id);
    return this.element.querySelector('#' + id).value;
  }
  createButtons() {
    let div = document.createElement('div');
    div.classList.add('block');

    let btnConfirm = document.createElement('button');
    btnConfirm.classList.add('inline-block', 'btn');
    btnConfirm.textContent = 'Confirm';
    btnConfirm.onclick = () => {this.onConfirm();};

    let btnCancel = document.createElement('button');
    btnCancel.classList.add('inline-block', 'btn');
    btnCancel.textContent = 'Cancel';
    //btnCancel.setAttribute('onclick', () => {this.onCancel});
    btnCancel.onclick = () => {this.onCancel();};

    div.appendChild(btnConfirm);
    div.appendChild(btnCancel);

    return div;
  }
}
