'use babel';

const CONSTANT = require('../common/constantValues');
const DialogView = require('./dialog-view');

module.exports =
class OneLineArgsView extends DialogView {
  constructor(placeHolder, labelText) {
    super.constructor();
    this.element.appendChild(this.createLabelAndInput('OneLineArgsView-args', placeHolder, labelText));
    this.element.appendChild(this.createButtons());
  }
  getArgs(){
    return this.getValueById('OneLineArgsView-args');
  }
  setArgs(args){
    this.setValueById('OneLineArgsView-args', args);
  }
};
