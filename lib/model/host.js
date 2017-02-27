'use babel';
const Path = require('path');

const CONSTANT = require('../common/constantValues');

const FileInfo = require('./fileinfo');
const Commands = require('./commands');

class Host {
  constructor(alias, hostname, username, authMethod, keyFile, password, lastOpenDirectory, httpPort) {
    this.alias = alias;
    this.hostname = hostname;
    this.username = username;
    this.authMethod = authMethod;
    this.keyFile = keyFile;
    this.password = password;
    this.lastOpenDirectory = lastOpenDirectory;
    this.httpPort = httpPort;
  }

  getFilesMetadata(path) {
    return Commands.statfunc(path, this).then((value) => {
      return FileInfo.getSourceDataResolver(CONSTANT.FileSourceDataType.STATJSON)(value, this, path);
    });
  }
  toJSON() {
    return {'alias': this.alias, 'hostname': this.hostname, 'username': this.username, 'authMethod': Symbol.keyFor(this.authMethod), 'keyFile': this.keyFile, 'password': this.password, 'lastOpenDirectory': this.lastOpenDirectory, 'httpPort': this.httpPort};
  }
};
Host.fromJSON = (jsonInfo) => {
  return new Host(jsonInfo.alias, jsonInfo.hostname, jsonInfo.username, Symbol.for(jsonInfo.authMethod), jsonInfo.keyfile, jsonInfo.password, jsonInfo.lastOpenDirectory, jsonInfo.httpPort);
}

Host.GetVCSHost = function () {
  if (Host.VCSHost === undefined || Host.VCSHost === null || !Host.VCSHost instanceof Host) {
    let name = atom.config.get('clearcase.remoteHost');
    let user = atom.config.get('clearcase.remoteUser');
    let authMethod = CONSTANT.AuthMethod.PUBLICKEY;
    let keyfile = atom.config.get('clearcase.identity');
    Host.VCSHost = new Host('', name, user, CONSTANT.AuthMethod.PUBLICKEY, keyfile, '', '~/');
  }
  return Host.VCSHost;
};

module.exports = Host;
