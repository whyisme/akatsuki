'use babel';
const $$ = require('atom-space-pen-views').$$;
const SelectListView = require('atom-space-pen-views').SelectListView;

let __hasProp = {}.hasOwnProperty;
let __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports =
OpenFileView = (function(superClass){
  __extends(OpenFileView, superClass);
  function OpenFileView(){
    return OpenFileView.__super__.constructor.apply(this, arguments);
  };
  OpenFileView.prototype.viewForItem = function(item){
    return $$(function(){
      let self = this;
      self.li(function(){
        self.div({class: 'primary-line icon globe'}, `${item}`);
        self.div({class: 'secondary-line no-icon text-subtle'}, `2nd line`);
      });
    });
  };
  OpenFileView.prototype.confirmed = (item) => {
    console.log(`${item} selected.`);
  };
  OpenFileView.prototype.getElement = function(){
    return this.element;
  };
  return OpenFileView;
})(SelectListView);
