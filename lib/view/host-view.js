'use babel';
//const View = require('atom-space-pen-views').View;
//const TextEditorView = require('atom-space-pen-views').TextEditorView;
//const SelectListView = require('atom-space-pen-views').SelectListView;
const Host = require('../model/host');
const CONSTANT = require('../common/constantValues');

module.exports =
class HostView {
  constructor(host) {
    this.element = document.createElement('div');
    this.element.classList.add('native-key-bindings');

    //this.element.appendChild(this.createHostName());
    this.element.appendChild(this.createLabelAndInput('hostview-name', 'Host Name', 'Name:'));
    this.element.appendChild(this.createLabelAndInput('hostview-host', 'Host', 'Host:'));
    this.element.appendChild(this.createLabelAndInput('hostview-user', 'User', 'User:'));
    this.element.appendChild(this.createLabelAndInput('hostview-password', 'Password', 'Password:'));
    this.element.querySelector('#hostview-password').setAttribute('type', 'password');
    this.element.appendChild(this.createLabelAndInput('hostview-port', 'HTTP Port', 'HTTP port:'));

    this.element.appendChild(this.createButtons());
    if (host) {
      this.host = host;
      this.setName(this.host.alias);
      this.setHost(this.host.hostname);
      this.setUser(this.host.username);
      this.setPassword(this.host.password);
      this.setPort(this.host.httpPort);
    } else {
      this.host = new Host('', '', '', CONSTANT.AuthMethod.PASSWORD, '', '', '.', '');
    }

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
    this.hide();
    this.host.alias = this.getName();
    this.host.hostname = this.getHost();
    this.host.username = this.getUser();
    this.host.password = this.getPassword();
    this.host.httpPort = this.getPort();

    if (typeof this.confirmCallback === 'function') {
      this.confirmCallback(this.host);
    }
    return this.host;
  }
  onCancel() {
    this.hide();
  }
  hide() {
    this.panel.hide();
  }
  show() {
    this.panel.show();
  }
  setValueById(id, value) {
    this.element.querySelector('#' + id).value = value;
  }
  getValueById(id) {
    let ele = this.element.querySelector('#' + id);
    return this.element.querySelector('#' + id).value;
  }
  setName(name) {
    this.setValueById('hostview-name', name);
  }
  getName() {
    return this.getValueById('hostview-name');
  }
  setHost(host) {
    this.setValueById('hostview-host', host);
  }
  getHost() {
    return this.getValueById('hostview-host');
  }
  setUser(user) {
    this.setValueById('hostview-user', user);
  }
  getUser() {
    return this.getValueById('hostview-user');
  }
  setPassword(pass) {
    this.setValueById('hostview-password', pass);
  }
  getPassword() {
    return this.getValueById('hostview-password');
  }
  setPort(port) {
    this.setValueById('hostview-port', port);
  }
  getPort() {
    return this.getValueById('hostview-port');
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
