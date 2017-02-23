'use babel';

const fs = require('fs-plus');
const path = require('path');
const CONSTANT = require('../common/constantValues');
const iconClassMap = {};
iconClassMap[CONSTANT.FileStatus.CHECKED_OUT] = 'ccstatus-checkedout';
iconClassMap[CONSTANT.FileStatus.CHECKED_OUT_BY_ANOTHER_USER] = 'ccstatus-othersco';
iconClassMap[CONSTANT.FileStatus.CHECKED_IN] = 'ccstatus-checkedin';
iconClassMap[CONSTANT.FileStatus.PRIVATE] = 'ccstatus-private';

class FileIcon {
  constructor(filesInfo) {
    this.setFilesInfo(filesInfo);
  }
  iconClassForPath(filePath) {
    let iconClassArr = [];
    if (this.getFilesInfo().has(filePath)) {
      iconClassArr.push(iconClassMap[this.getFilesInfo().get(filePath).getCoFlag()]);
    }
    let extension = path.extname(filePath);
    if (fs.isSymbolicLinkSync(filePath)) {
      iconClassArr.push('icon-file-symlink-file');
    } else if (fs.isReadmePath(filePath)) {
      iconClassArr.push('icon-book');
    } else if (fs.isCompressedExtension(extension)) {
      iconClassArr.push('icon-file-zip');
    } else if (fs.isImageExtension(extension)) {
      iconClassArr.push('icon-file-media');
    } else if (fs.isPdfExtension(extension)) {
      iconClassArr.push('icon-file-pdf');
    } else if (fs.isBinaryExtension(extension)) {
      iconClassArr.push('icon-file-binary');
    } else {
      iconClassArr.push('icon-file-text');
    }
    return iconClassArr.join(' ');
  }
  setFilesInfo(filesInfo) {
    this.filesInfo = filesInfo;
  }
  getFilesInfo(filesInfo) {
    return this.filesInfo;
  }
}

module.exports = FileIcon;
