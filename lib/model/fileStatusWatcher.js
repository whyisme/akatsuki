'use babel';
//ClearCase file status watcher

const Emitter = require('atom').Emitter;
const CompositeDisposable = require('atom').CompositeDisposable;
const FileInfo = require('./fileInfo');

class FileStatusWatcher {
  constructor() {
    this.checkList = new Map();
    //TODO: magic number, parameterized later?
    this.intervalTime = 5000;
    this.funcMap = new Map();
    this.intervalID = setInterval(() => {
      this.checkStatus();
    }, this.intervalTime);
  }
  checkStatus() {
    //TODO: deal with callback order?
    console.log('checkStatus:');
    for (let entry of this.checkList) {
      console.log(`${entry[1]}:${entry[0]}`);
      if (this.funcMap.has(entry[1])) {
        this.funcMap.get(entry[1])(entry[0]);
      }
    }
    this.checkList = new Map();
  }
  addCheckVisitor(name, func) {
    this.funcMap.set(name, func);
  }
  addFile(path, type) {
    this.checkList.set(path, type);
  }
  release() {
    clearInterval(this.intervalID);
  }
}

module.exports = FileStatusWatcher;
