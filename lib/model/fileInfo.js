'use babel';
const Path = require('path');
const FS = require('fs-plus');
const CONSTANT = require('../common/constantValues');
const SourceConventer = require('../common/sourceConventer');
const Emitter = require('atom').Emitter;
const CompositeDisposable = require('atom').CompositeDisposable;
const Commands = require('./commands');
const Utils = require('../common/utils');
const ExtInfo = require('./extInfo');

let privateProps = new WeakMap();

class FileInfo {
  constructor(name, host, path, mode, size, mtime, checkedout, extInfo = {}) {
    privateProps.set(this, {
      "name": Path.basename(name),
      "locations": new Map(),
      "size": size,
      "mode": mode,
      "mtime": mtime,
      "coFlag": checkedout,
      "watcher": {},
      "extInfo": extInfo
    });
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    this.addLocation(host, path);
  }
  update(host, path, mode, size, mtime) {
    this.setMode(mode);
    this.setSize(size);
    this.setMTime(mtime);
    this.addLocation(host, path);
  }
  release() {
    this.disposables.dispose();
  }
  onFileChange(callback) {
    this.disposables.add(this.emitter.on(CONSTANT.EventType.FILE_CHANGE, callback));
  }
  onFileRename(callback) {
    this.disposables.add(this.emitter.on(CONSTANT.EventType.FILE_RENAME, callback));
  }
  addLocation(host, path) {
    if (!host) {
      return false;
    }
    privateProps.get(this).locations.set(host, Path.normalize(path));
    if (host === CONSTANT.FileLocation.LOCAL_FILE_LOCATION) {
      if (privateProps.get(this).watcher.constructor.name === 'FSWatcher') {
        privateProps.get(this).watcher.close();
      }
      if (!this.isDir()) {
        return;
      }
      privateProps.get(this).watcher = FS.watch(this.getLocation(host), {recursive: false}, (event, path) => {
        if (event === 'change') {
          this.emitter.emit(CONSTANT.EventType.FILE_CHANGE, {emitterPath: this.getLocation(host), eventPath: path});
        } else if (event === 'rename') {
          this.emitter.emit(CONSTANT.EventType.FILE_RENAME, {emitterPath: this.getLocation(host), eventPath: path});
        } else {
          console.log(event);
        }
      });
    }
  }
  removeLocation(host) {
    privateProps.get(this).locations.delete(host);
  }
  setSize(size) {
    privateProps.get(this).size = size;
  }
  setMTime(mTime) {
    privateProps.get(this).mtime = mTime;
  }
  setMode(mode) {
    privateProps.get(this).mode = mode;
  }
  setCoFlag(checkedout) {
    privateProps.get(this).coFlag = checkedout;
  }
  setLocations(locations) {
    privateProps.get(this).locations = locations;
  }
  getLocations() {
    return privateProps.get(this).locations;
  }
  getLocation(host) {
    return privateProps.get(this).locations.get(host);
  }
  getName() {
    return privateProps.get(this).name;
  }
  getSize() {
    return privateProps.get(this).size;
  }
  getMode() {
    return privateProps.get(this).mode;
  }
  getPermissions() {
    let permissionMask = 0777;
    let permissions = this.getMode() & permissionMask;
    return permissions;
  }
  getPermissionsReadable() {
    let permissions = this.getPermissions();
    return permissions.toString(8);
  }
  getMtime() {
    return privateProps.get(this).mtime;
  }
  isFile() {
    let typeMask = 0170000;
    let type = this.getMode() & typeMask;
    return type === 0100000;
  }
  isDir() {
    let typeMask = 0170000;
    let type = this.getMode() & typeMask;
    return type === 040000;
  }
  isLink() {
    let typeMask = 0170000;
    let type = this.getMode() & typeMask;
    return type === 0120000;
  }
  isWritable() {
    let userWriteMask = 0200;
    let write = this.getMode() & userWriteMask;
    return write === 0200;
  }
  getCoFlag() {
    return privateProps.get(this).coFlag;
  }
  setExtInfo(extInfo) {
    privateProps.get(this).extInfo = extInfo;
  }
  getExtInfo() {
    return privateProps.get(this).extInfo;
  }
  toString() {
    return `{'name': ${this.getName()}, 'mode:': ${this.getMode()}}`;
  }
  toJSON() {
    return {'name': this.getName(), 'mode:': this.getMode(), 'size': this.getSize(), 'mtime': this.getMtime(), 'coFlag': Symbol.keyFor(this.getCoFlag()), 'locations': Utils.infoMapToJson(this.getLocations()), 'extInfo': this.getExtInfo()};
  }
};
FileInfo.fromJSON = (jsonInfo) => {
  let fileInfo = new FileInfo(jsonInfo.name, '', '', jsonInfo.mode, jsonInfo.size, jsonInfo.mtime, Symbol.for(jsonInfo.coFlag), ExtInfo.fromJSON(jsonInfo.extInfo));
  fileInfo.setLocations(Utils.jsonToInfoMap(jsonInfo.locations));
  return fileInfo;
};
FileInfo.addSourceDataType = SourceConventer.addSourceDataType;
FileInfo.getSourceDataResolver = SourceConventer.getSourceDataResolver;
FileInfo.addSourceDataType(CONSTANT.FileSourceDataType.STAT, '"%SN##%Sp##%Dz##%Sm%%%%"', (src, host, dir) => {
  let fullInfo = src.join('').replace(/[\r\n]/g, '').split('%%');
  let fileItems = [];
  for(let i = 0; i < fullInfo.length; i++) {
    if (!fullInfo[i]) {
      continue;
    }
    let fileItem = fullInfo[i].split('##');
    let fileInfo = new FileInfo(fileItem[0], host.alias, fileItem[0], fileItem[1][0], fileItem[2], fileItem[1].substr(1), fileItem[3]);
    fileItems.push(fileInfo);
  }
  return fileItems;
});
FileInfo.addSourceDataType(CONSTANT.FileSourceDataType.STATJSON, 'agent?type=stat&path=', (src, host, dir) => {
  let fullInfo = typeof src === 'string' ? JSON.parse(src) : src;
  return fullInfo.map((cur, index, arr) => {
    let stats = cur.stats;
    return new FileInfo(cur.file, host.alias, cur.file, stats.mode, stats.size, stats.mtime, CONSTANT.FileStatus.UNKNOWN);
  });
});
FileInfo.getFileInfoFromFS = (path, filesInfo, fileStatusWatcher, ignorePattern = []) => {
  if (Array.isArray(ignorePattern)) {
    for (let i = 0; i < ignorePattern.length; i++) {
      if (path.match(ignorePattern[i])) {
        return;
      }
    }
  }
  let stats = null;
  try {
    stats = FS.statSync(path);
  } catch (e) {
    console.log(e);
    if (filesInfo.has(path)) {
      filesInfo.get(path).release();
      filesInfo.delete(path);
    }
    return;
  }
  if (filesInfo.has(path)) {
    filesInfo.get(path).update(CONSTANT.FileLocation.LOCAL_FILE_LOCATION, path, stats.mode, stats.size, stats.mtime);
  } else {
    let fileInfo = new FileInfo(path, CONSTANT.FileLocation.LOCAL_FILE_LOCATION, path, stats.mode, stats.size, stats.mtime, CONSTANT.FileStatus.UNKNOWN);
    fileInfo.onFileRename((event) => {
      //add path to interval checklist(currentList and nextList).
      console.log(event);
      if (event.hasOwnProperty('emitterPath')) {
        fileStatusWatcher.addFile(event.emitterPath, CONSTANT.EventType.FILE_RENAME);
      }
    });
    filesInfo.set(path, fileInfo);
  }
  if (stats.isDirectory()) {
    let files = FS.readdirSync(path);
    for (let i = 0; i < files.length; i++) {
      FileInfo.getFileInfoFromFS(Path.join(path, files[i]), filesInfo, fileStatusWatcher, ignorePattern);
    }
  }
};
FileInfo.updateFilesStatus = (path, filesInfo, viewPrivateList, checkedoutByMeList, checkedoutByOthersList) => {
  console.log(viewPrivateList);
  console.log(checkedoutByMeList);
  console.log(checkedoutByOthersList);
  filesInfo.forEach((value, key, map) => {
    if (!key.includes(path)) {
      return;
    }
    if (viewPrivateList.includes(key)) {
      value.setCoFlag(CONSTANT.FileStatus.PRIVATE);
    } else if (checkedoutByMeList.includes(key)) {
      value.setCoFlag(CONSTANT.FileStatus.CHECKED_OUT);
    } else if (checkedoutByOthersList.includes(key)){
      value.setCoFlag(CONSTANT.FileStatus.CHECKED_OUT_BY_ANOTHER_USER);
    } else {
      value.setCoFlag(CONSTANT.FileStatus.CHECKED_IN);
    }
  });
};
FileInfo.checkFileStatus = (checkPath, filesInfo) => {
  let privateList = null;
  let checkedoutByMeList = null;
  let checkedoutByOthersList = null;
  let promiseCheckStatus = Commands.login().then((value) => {
    return Commands.list(checkPath, true);
  }).then((value) => {
    privateList = value.join('\r\n').split('\r\n');
    return Commands.lscheckout(checkPath, true);
  }).then((value) => {
    checkedoutByMeList = value.join('\r\n').split('\r\n');
    return Commands.lscheckout(checkPath);
  }).then((value) => {
    checkedoutByOthersList = FileInfo.genCheckedoutByOthersList(value.join('\r\n').split('\r\n'), checkedoutByMeList);
    checkedoutByMeList = FileInfo.normalizeCheckedoutList(checkPath, checkedoutByMeList);
    checkedoutByOthersList = FileInfo.normalizeCheckedoutList(checkPath, checkedoutByOthersList);
    privateList = FileInfo.normalizeViewPrivateList(privateList);
    FileInfo.updateFilesStatus(checkPath, filesInfo, privateList, checkedoutByMeList, checkedoutByOthersList);
    return filesInfo;
  });
  return promiseCheckStatus;
};
FileInfo.normalizeViewPrivateList = (list) => {
  let magicFilterMsg = 'CRCLI2050E';
  return list.filter((value) => {
    return !value.includes(magicFilterMsg) && value.trim() !== '';
  });
}
FileInfo.normalizeCheckedoutList = (path, list) => {
  const magicWord = 'vobs';
  if (!path.includes(magicWord)) {
    return list;
  }
  let subindex = path.indexOf(magicWord);
  let rootPath = path.substr(0, subindex);
  return list.reduce((normalizedList, value) => {
    if (value.trim() !== '') {
      normalizedList.push(Path.join(rootPath, value));
    }
    return normalizedList;
  }, []);
};
FileInfo.genCheckedoutByOthersList = (list, excludeList) => {
  return list.filter((value) => {
    return !excludeList.includes(value);
  });
};
module.exports = FileInfo;
