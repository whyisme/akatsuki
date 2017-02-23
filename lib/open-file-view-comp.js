'use babel';
const $$ = require('atom-space-pen-views').$$;
const SelectListView = require('atom-space-pen-views').SelectListView;

let __hasProp = {}.hasOwnProperty;
let __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports =
class OpenFileView extends SelectListView {
  constructor(items) {
    super();
    this.setItems(items);
  }

  viewForItem(item) {
    return `<li>${item}</li>`;
  }

  confirmed(item) {
    console.log(`${item} selected.`);
  }

  getElement() {
    return this.element;
  }
}
