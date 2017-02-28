'use babel';

const Path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const querystring = require('querystring');
const sshcmd = require('./communication').sshcmd;
const scpcmd = require('./communication').scpcmd;
const cmd = require('./communication').cmd;
const httpcmd = require('./communication').httpcmd;
const CONSTANT = require('../common/constantValues');

let getRcleartool = () => {
  let bin = atom.config.get('clearcase.rcleartoolPath');
  if (!bin) {
    throw 'rcleartool not found!';
  }
  return bin;
};

let Win32Escape = {
  '|': '^^^|',
  '&': '^^^&',
  '"': '^^^"',
  '!': '^^^^!',
  '^': '^^^^'
};

let strForWin32CLI = (originalStr) => {
  let win32Str = "";
  Win32Escape['^'] = originalStr.includes('!') ? '^^^^^^^^' : '^^^^';
  for (let i = 0; i < originalStr.length; i++) {
    if (Win32Escape.hasOwnProperty(originalStr[i])) {
      win32Str += Win32Escape[originalStr[i]];
    } else {
      win32Str += originalStr[i];
    }
  }
  return win32Str;
};

let strForCLI = (originalStr) => {
  let cliStr = originalStr;
  if (os.platform() === 'win32') {
    cliStr = strForWin32CLI(originalStr);
  }
  return cliStr;
};

let getRcleartoolCredential = () => {
  let user = atom.config.get('clearcase.remoteUser');
  let pass = atom.config.get('clearcase.remotePassword');
  let server = atom.config.get('clearcase.remoteUrl');
  if (!user || !pass) {
    throw 'username or password missing!';
  }
  //密码要符合命令行参数规则，所以这里进行必要的转义
  let cliPass = strForCLI(pass);
  let credential = [];
  credential.push('-lname');
  credential.push(user);
  credential.push('-pass');
  credential.push(cliPass);
  credential.push('-server');
  credential.push(server);
  return credential;
};

module.exports = {
  login: () => {
    let command = getRcleartool();
    let args = [];
    args.push('login');
    args = args.concat(getRcleartoolCredential());
    let successRetVal = [0, 1];
    return cmd(command, args, CONSTANT.Directory.DEFAULT_DIR, successRetVal);
  },

  loginFake: () => {
    return Promise.resolve(true);
  },

  checkout: (fileName, comment) => {
    let command = getRcleartool();
    let args = [];
    args.push('co');
    args.push('-c');
    args.push(comment);
    args.push(fileName);
    let cwd = '.';
    let successRetVal = [0, 1];
    return cmd(command, args, CONSTANT.Directory.DEFAULT_DIR, successRetVal);
  },

  undoCheckout: (fileName) => {
    let command = getRcleartool();
    let args = [];
    args.push('unco');
    args.push('-rm');
    args.push(fileName);
    return cmd(command, args, CONSTANT.Directory.DEFAULT_DIR);
  },

  checkin: (fileName, comment, identical) => {
    let command = getRcleartool();
    let args = [];
    args.push('ci');
    args.push('-c');
    args.push(comment);
    if (identical) {
      args.push('-identical');
    }
    args.push(fileName);
    return cmd(command, args, CONSTANT.Directory.DEFAULT_DIR);
  },

  lscheckout: (path, onlyme = false) => {
    let command = getRcleartool();
    let args = [];
    args.push('lsco');
    args.push('-short');
    args.push('-r');
    if (onlyme) {
      args.push('-me');
    }
    args.push(path);
    let cwd = path;
    return cmd(command, args, cwd);
  },

  lscheckoutFake: (path, onlyme = false) => {
    let command = 'cat';
    let args = [];
    args.push(Path.join(path, onlyme ? 'checkedoutByMeListTest.txt' : 'checkedoutListTest.txt'));
    return cmd(command, args, CONSTANT.Directory.DEFAULT_DIR);
  },

  list: (path, viewOnly = false) => {
    let command = getRcleartool();
    let args = [];
    args.push('ls');
    args.push('-short');
    args.push('-r');
    args.push('-nxn');
    if (viewOnly) {
      args.push('-vie');
    }
    args.push(path);
    return cmd(command, args, CONSTANT.Directory.DEFAULT_DIR);
  },

  listFake: (path, viewOnly = false) => {
    let command = 'cat';
    let args = [];
    args.push(Path.join(path, 'privateListTest.txt'));
    return cmd(command, args, CONSTANT.Directory.DEFAULT_DIR);
  },

  mkelem: (path, comment, dir = null) => {
    let command = getRcleartool();
    let args = [];
    args.push('mkelem');
    if (comment) {
      args.push('-c');
      args.push(comment.toString());
    } else {
      args.push('nc');
    }
    args.push('-ci');
    let cwd = CONSTANT.Directory.DEFAULT_DIR;
    if (dir) {
      args.push('-mkpath');
      args.push(Path.relative(dir, path));
      cwd = dir;
    } else {
      args.push(Path.basename(path));
      cwd = Path.dirname(path);
    }
    return cmd(command, args, cwd);
  },

  set: (key, value) => {
    let command = getRcleartool();
    let args = [];
    args.push('set');
    args.push('-pref');
    args.push(key);
    args.push('-val');
    args.push(value);
    return cmd(command, args, CONSTANT.Directory.DEFAULT_DIR);
  },

  setActiity: (activity, dir) => {
    let command = getRcleartool();
    let args = [];
    args.push('setact');
    args.push(activity);
    return sshcmd(command, args, dir);
  },

  setView: (tag) => {
    var args = [];
    args.push(CONSTANT.cleartool);
    args.push('startview');
    args.push(tag);
    return sshcmd(args);
  },

  recvFile: (localPath, remotePath) => {
    console.log(`recvFile:\nlocalPath:${localPath}\nremotePath:${remotePath}`);
    return scpcmd(localPath, remotePath, 'recv');
  },

  sendFile: (localPath, remotePath) => {
    return scpcmd(localPath, remotePath, 'send');
  },

  echo: (content) => {
    console.log(`echo content: ${content}`);
    var args = [];
    args.push('echo');
    args.push(content);
    return sshcmd(args);
  },

  stat: (path) => {
    let args = [];
    args.push('stat');
    args.push('-f');
    args.push('"%SN##%Sp##%Dz##%Sm%%%%"');
    args.push(path);
    return sshcmd(args);
  },
  statfunc: (path, host) => {
    let args = {};
    args.type = 'stat';
    args.path = path;
    return httpcmd(args, host);
  },
  upload: (remoteDir, host, localPath) => {
    let args = {};
    args.type = 'receiveFile';
    args.dir = remoteDir;
    args.file = Path.basename(localPath);
    let reader = fs.createReadStream(localPath);
    return httpcmd(args, host, reader);
  },
  make: (remoteDir, host, target) => {
    let args = {};
    args.type = 'make';
    args.path = remoteDir;
    args.target = target;
    return httpcmd(args, host);
  }
};
