'use babel';
const path = require('path');

class FileLocation {
  //args:
  //host:     string
  //          host.alias
  //dir:      string
  //          dir of the file on host
  //extInfo:  Object
  //          extra infomation
  constructor(host, dir, extInfo = {}) {
    this.host = host;
    this.dir = dir;
    this.extInfo = extInfo;
  }
  
}
