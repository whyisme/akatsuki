'use babel';
const $$ = require('atom-space-pen-views').$$;
const SelectListView = require('atom-space-pen-views').SelectListView;
const FileInfo = require('../model/fileinfo');
const Commands = require('../model/commands');
const ErrorCheck = require('../common/errorCheck');

let __hasProp = {}.hasOwnProperty;
let __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports =
FilesView = (function(superClass){
  __extends(FilesView, superClass);
  function FilesView(host, options = {}){
    this.host = host;
    this.dirOnly = options.dirOnly ? true : false;

    return FilesView.__super__.constructor.apply(this, arguments);
  };
  FilesView.prototype.viewForItem = function(item){
    return $$(function(){
      let self = this;
      self.li(function(){
        if (item.isFile()) {
          self.div({class: 'primary-line icon icon-file-text'}, item.getName());
        } else if (item.isDir()) {
          self.div({class: 'primary-line icon icon-file-directory'}, item.getName());
        } else if (item.isLink()){
          self.div({class: 'primary-line icon icon-file-symlink-file'}, item.getName());
        } else {
          self.div({class: 'primary-line'}, item.getName());
        }

        self.div({class: 'secondary-line no-icon text-subtle'}, `Size: ${item.getSize()}, Mtime: ${item.getMtime()}, Permissions: ${item.getPermissionsReadable()}`);
      });
    });
  };
  FilesView.prototype.dblclicked = function(item){
    if (item.isDir()) {
      this.onChangeDir(item);
    } else if (item.isFile()){
      this.confirmCallback(item);
    }
  };
  FilesView.prototype.afterMouseup = function(item){
    //do nothing but select.
  };
  FilesView.prototype.btnConfirmed = function(){
    let item = this.getSelectedItem();
    if (item && item.constructor.name === 'FileInfo') {
      this.hide();
      this.confirmCallback(item);
    }
  };
  FilesView.prototype.confirmCallback = function (item) {

  };
  FilesView.prototype.cancelCallback = function () {

  };
  FilesView.prototype.promiseShow = function () {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.confirmCallback = (item) => {
        resolve(item);
      };
      self.cancelCallback = () => {
        reject('Cancelled.');
      };
      self.show();
    });
  }
  FilesView.prototype.confirmed = FilesView.prototype.afterMouseup;
  FilesView.prototype.onChangeDir = function(item) {
    this.setPath(item.getLocation(this.host.alias));
  };
  FilesView.prototype.getElement = function(){
    return this.element;
  };
  FilesView.prototype.setPath = function(path) {
    if (!path) {
      path = this.host.lastOpenDirectory;
    }
    return this.host.getFilesMetadata(path).then((files) => {
      let filteredFiles = null;
      if (this.dirOnly) {
        filteredFiles = files.filter((elem, index, arr) => {
          if (elem.isDir()) {
            return true;
          }
          return false;
        });
      } else {
        filteredFiles = files;
      }
      this.setItems(filteredFiles);
    });
  };
  FilesView.prototype.show = function() {
    console.log(this.element);
    if (this.panel === undefined || this.panel === null) {
      //hack: add Confirm button
      let divButton = document.createElement('div');
      divButton.classList.add('block');
      let btnConfirm = document.createElement('button');
      btnConfirm.classList.add('btn');
      btnConfirm.onclick = () => {this.btnConfirmed()};
      btnConfirm.textContent = 'Confirm';
      divButton.appendChild(btnConfirm);
      //hack: add Cancel button
      let btnCancel = document.createElement('button');
      btnCancel.classList.add('btn');
      btnCancel.onclick = () => {this.cancelled()};
      btnCancel.textContent = 'Cancel';
      divButton.appendChild(btnCancel);
      this.element.appendChild(divButton);
      this.panel = atom.workspace.addModalPanel({item: this.element, visible: false});
      //add dblclick evt listener
      this.list.on('dblclick', 'li', (e) => {
        if (e.currentTarget.classList.contains('selected')) {
          this.dblclicked(this.getSelectedItem());
        }
        e.preventDefault();
        return false;
      });
      //remove filterEditor
      let filterEditor = this.element.querySelector('atom-text-editor');
      if (filterEditor) {
        this.element.removeChild(filterEditor);
      }
    }
    this.panel.show();
  };
  FilesView.prototype.hide = function() {
    if (this.panel === undefined || this.panel === null) {
      this.panel = atom.workspace.addModalPanel({item: this.element, visible: false});
    }
    this.panel.hide();
  };
  FilesView.prototype.cancelled = function() {
    this.hide();
    this.cancelCallback();
  };
  return FilesView;
})(SelectListView);
