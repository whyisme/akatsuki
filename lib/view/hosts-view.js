'use babel';
const $$ = require('atom-space-pen-views').$$;
const SelectListView = require('atom-space-pen-views').SelectListView;

let __hasProp = {}.hasOwnProperty;
let __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports =
HostsView = (function(superClass){
  __extends(HostsView, superClass);
  function HostsView(){
    return HostsView.__super__.constructor.apply(this, arguments);
  };
  HostsView.prototype.viewForItem = function(item){
    console.log(item);
    return $$(function(){
      let self = this;
      self.li(function(){
        self.div({class: 'primary-line icon icon-server'}, item.alias);
        self.div({class: 'secondary-line no-icon text-subtle'}, `Host: ${item.hostname}, User: ${item.username}`);
      });
    });
  };
  HostsView.prototype.nonPromiseConfirmed = function(item) {
    this.hide();
  };
  HostsView.prototype.nonPromiseCancelled = function() {
    this.hide();
  };
  HostsView.prototype.confirmed = HostsView.prototype.nonPromiseConfirmed;
  HostsView.prototype.cancelled = HostsView.prototype.nonPromiseCancelled;
  HostsView.prototype._show = function() {
    if (typeof this.panel === undefined || !this.panel) {
      let divButton = document.createElement('div');
      divButton.classList.add('block');
      //hack: add Cancel button
      let btnCancel = document.createElement('button');
      btnCancel.classList.add('btn');
      btnCancel.onclick = () => {this.cancelled()};
      btnCancel.textContent = 'Cancel';
      divButton.appendChild(btnCancel);
      this.element.appendChild(divButton);
      this.panel = atom.workspace.addModalPanel({item: this.element, visible: false});

      //remove filterEditor
      let filterEditor = this.element.querySelector('atom-text-editor');
      if (filterEditor) {
        this.element.removeChild(filterEditor);
      }
    }
    this.panel.show();
  };
  HostsView.prototype.promiseShow = function() {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.confirmed = function (item) {
        this.hide();
        resolve(item);
      };
      self.cancelled = function () {
        reject('no host selected.');
        this.hide();
      };
      self._show();
    });
  };
  HostsView.prototype.show = function() {
    let self = this;
    self.confirmed = self.nonPromiseConfirmed;
    self.cancelled = self.nonPromiseCancelled;
    self._show();
  };
  HostsView.prototype.hide = function() {
    if (typeof this.panel === undefined || this.panel === null) {
      this.panel = atom.workspace.addModalPanel({item: this.element, visible: false});
    }
    this.panel.hide();
  };
  return HostsView;
})(SelectListView);
