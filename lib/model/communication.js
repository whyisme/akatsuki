'use babel';

const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');
const http = require('http');
const querystring = require('querystring');

let cmd = (command, args, cwd, successRetVal = [0]) => {
  return new Promise((resolve, reject) => {
    const spawn = require('child_process').spawn;
    console.log(`command:${command}\nargs:${args}`);
    let proc = spawn(command, args, {cwd: cwd});
    let outInfo = [];
    let errInfo = [];
    proc.stdout
      .pipe(iconv.decodeStream('gbk'))
      .on('data', (data) => {
        console.log(`stdout: ${data}`);
        outInfo.push(data);
      });
    proc.stderr
      .pipe(iconv.decodeStream('gbk'))
      .on('data', (data) => {
        console.log(`stderr: ${data}`);
        errInfo.push(data);
      });
    proc.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      if (!successRetVal.includes(code)) {
        let arrEInfo = errInfo.join('\n');
        reject(new Error({'code': code, 'message': arrEInfo}));
      } else {
        resolve(outInfo);
      }
    });
    proc.on('error', (err) => {
      console.log(err.toString());
      reject(err);
    });
  });
};

let httpcmd = (args, host) => {
  return new Promise(function(resolve, reject) {
    let querys = querystring.stringify(args);
    let options = {
      host: host.hostname,
      port: host.httpPort,
      path: `/agent?${querys}`
    };
    let req = http.request(options, (res) => {
      let resInfo = [];
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        resInfo.push(chunk);
      });
      res.on('end', () => {
        resolve(resInfo);
      });
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
};

let httpPostCmd = (args, host, reader) => {
  console.log(args);
  return new Promise(function(resolve, reject) {
    let querys = querystring.stringify(args);
    let options = {
      host: host.hostname,
      port: host.httpPort,
      path: `/agent?${querys}`,
      method: 'POST'
    };
    let req = http.request(options, (res) => {
      let resInfo = [];
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        resInfo.push(chunk);
      });
      res.on('end', () => {
        resolve(resInfo);
      });
    });
    req.on('error', (e) => {
      reject(e);
    });
    reader.pipe(req);
  });
};

let sshcmd = (args) => {
  const command = atom.config.get('clearcase.sshBinPath');
  const remoteHost = atom.config.get('clearcase.remoteHost');
  const remoteUser = atom.config.get('clearcase.remoteUser');
  args = [remoteUser+'@'+remoteHost].concat(args);
  const identity = atom.config.get('clearcase.identity');
  if (identity !== undefined && identity !== null) {
    args = ['-i', identity].concat(args);
  }
  return cmd(command, args);
};
let scpcmd = (local, remote, direction) => {
  const command = atom.config.get('clearcase.scpBinPath');
  const remoteHost = atom.config.get('clearcase.remoteHost');
  const remoteUser = atom.config.get('clearcase.remoteUser');
  const remotePath = remoteUser + '@' + remoteHost + ':' + remote;
  var args = ['-r'];
  if (direction === 'recv') {
    args.push(remotePath);
    args.push(local);
  } else {
    args.push(local);
    args.push(remotePath);
  }
  const identity = atom.config.get('clearcase.identity');
  if (identity !== undefined && identity !== null && identity !== '') {
    args = ['-i', identity].concat(args);
  }
  return cmd(command, args);
};
module.exports.sshcmd = sshcmd;
module.exports.scpcmd = scpcmd;
module.exports.cmd = cmd;
module.exports.httpcmd = httpcmd;
module.exports.httpPostCmd = httpPostCmd;
