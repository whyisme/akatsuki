'use babel';
const path = require('path');
const fs = require('fs');
const process = require('process');
const CompositeDisposable = require('atom').CompositeDisposable;
const HostView = require('./view/host-view');
const Commands = require('./model/commands');
const Host = require('./model/host');
const FileInfo = require('./model/fileinfo');
const ErrorCheck = require('./common/errorCheck');
const FileIcon = require('./model/fileIcon');
const FileStatusWatcher = require('./model/fileStatusWatcher');
const CONSTANT = require('./common/constantValues');
const FilesView = require('./view/files-view');
const HostsView = require('./view/hosts-view');
const Utils = require('./common/utils');
const CommandHistory = require('./model/commandHistory');
const OneLineArgsView = require('./view/one-line-args-view');

let resolveTreeSelection = () => {
  if (atom.packages.isPackageLoaded('tree-view')) {
    let treeView = atom.packages.getLoadedPackage('tree-view');
    treeView = require(treeView.mainModulePath);
    let serialView = treeView.serialize();
    return serialView.selectedPath;
  }
};

let resolveEditorFile = () => {
  let editor = atom.workspace.getActivePaneItem();
  let file = (editor !== 'undefined' && editor !== null) ? editor.buffer.file : void 0;
  return (file !== 'undefined' && file !== null) ? file.path : void 0;
};

let loadFileInfo = (filesInfo, fileStatusWatcher) => {
  let projectPath = getProjectPath();
  if (!projectPath) {
    return false;
  }
  let ignorePattern = [];
  ignorePattern.push(/node_modules/);
  FileInfo.getFileInfoFromFS(projectPath, filesInfo, fileStatusWatcher, ignorePattern);
};

let getProjectPath = () => {
  let projectPaths = atom.project.getPaths();
  if (!atom.packages.isPackageLoaded('tree-view')) {
    return false;
  }
  let treeView = atom.packages.getLoadedPackage('tree-view');
  treeView = require(treeView.mainModulePath);
  //TODO: bug: may be failed if more than one paths have the same file.
  let serialView = treeView.serialize();
  let filePath = serialView.selectedPath;
  let projectPath = projectPaths.filter((pathCandidate) => {
    return filePath.includes(pathCandidate);
  });
  if (projectPath.length < 1) {
    return false;
  };
  return projectPath[0];
};

let setTreeViewIcon = (filesInfo) => {
  if (!atom.packages.isPackageLoaded('tree-view')) {
    return false;
  }
  let treeView = atom.packages.getLoadedPackage('tree-view');
  treeView = require(treeView.mainModulePath);
  treeView.consumeFileIcons(new FileIcon(filesInfo));
};

let refreshTreeViewPath = (path, filesInfo) => {
  FileInfo.checkFileStatus(path, filesInfo)
          .then(() => {
            setTreeViewIcon(filesInfo);
          });
};

let getWorkingDir = (originPath, FilesInfo) => {
  let dir = null;
  let recurPath = originPath;
  while (FilesInfo.has(recurPath)) {
    if (FilesInfo.get(recurPath).getCoFlag() === CONSTANT.FileStatus.PRIVATE) {
      recurPath = path.dirname(recurPath);
      continue;
    }
    dir = recurPath;
    break;
  }
  return dir;
};

module.exports = Clearcase = {
  modalPanel: null,
  projectFilesInfo: null,
  emitter: null,
  disposables: null,
  fileStatusWatcher: null,
  hostsInfo: null,
  config: {
    sshBinPath: {
      title: 'SSH client bin path',
      description: 'Full path of a SSH client',
      type: 'string',
      'default': ''
    },
    remoteUser: {
      title: 'Remote user',
      description: 'Remote login username',
      type: 'string',
      'default': ''
    },
    remotePassword: {
      title: 'Remote Password',
      description: "Remote login Password",
      type: 'string',
      'default': ''
    },
    remoteUrl: {
      title: 'Remote Url',
      description: 'Remote Url',
      type: 'string',
      'default': ''
    },
    scpBinPath: {
      title: 'SSH copy bin path',
      description: 'Full path of a SCP client',
      type: 'string',
      'default': ''
    },
    viewTag: {
      title: 'CC View tag',
      description: 'id of a CC view',
      type: 'string',
      'default': ''
    },
    actTag: {
      title: 'CC Activity tag',
      description: 'id of a CC activity',
      type: 'string',
      'default': ''
    },
    workingPath: {
      title: 'Working Path',
      description: 'Working Path(for CC Web Views)',
      type: 'string',
      'default': ''
    },
    rcleartoolPath: {
      title: 'rcleartool Path',
      description: 'rcleartool Path',
      type: 'string',
      'default': ''
    },
    primaryGroup: {
      title: 'Primary Group',
      description: 'ClearCase Primary Group',
      type: 'string',
      'default': ''
    },
    groupList: {
      title: 'Group List',
      description: 'ClearCase Group List',
      type: 'string',
      'default': ''
    }
  },

  activate: function (state) {
    let self = this;
    console.log('activating...');
    console.log(atom.packages.getPackageDirPaths());
    console.log('state:');
    console.log(state);
    if (state.deserializer === 'ProjectInfo') {
      console.log(atom.deserializers);
      atom.deserializers.deserialize(state);
      console.log(self.projectFilesInfo);
      console.log(self.hostsInfo);
    } else {
      self.projectFilesInfo = new Map();
      self.hostsInfo = new Map();
    }
    self.fileStatusWatcher = new FileStatusWatcher();
    self.fileStatusWatcher.addCheckVisitor(CONSTANT.EventType.FILE_RENAME, (path) => {
      let ignorePattern = [];
      ignorePattern.push(/node_modules/);
      FileInfo.getFileInfoFromFS(path, self.projectFilesInfo, self.fileStatusWatcher, ignorePattern);

    });
    loadFileInfo(self.projectFilesInfo, self.fileStatusWatcher);
    console.log(self.projectFilesInfo);

    //emitter = new Emitter();
    self.disposables = new CompositeDisposable();
    self.disposables.add(atom.config.onDidChange('clearcase.primaryGroup', (event) => {Commands.set('CLEARCASE_PRIMARY_GROUP', event.newValue)}));
    self.disposables.add(atom.config.onDidChange('clearcase.groupList', (event) => {Commands.set('CLEARCASE_GROUP_LIST', event.newValue)}));
    Commands.set('CLEARCASE_PRIMARY_GROUP', atom.config.get('clearcase.primaryGroup'));
    Commands.set('CLEARCASE_GROUP_LIST', atom.config.get('clearcase.groupList'));
    Commands.set('PERSIST_SESSION_STATE', 'true');
    console.log('cpg loaded.');

    atom.commands.add('atom-workspace', {
      'clearcase:newHost': () => {
        let hostView = new HostView(null);
        hostView.confirmCallback = (hostInfo) => {
          this.hostsInfo.set(hostInfo.alias, hostInfo);
          console.log(this.hostsInfo);
        };
        hostView.show();
      },
      'clearcase:editHost': () => {
        let hostsView = new HostsView();
        hostsView.setItems(Array.from(this.hostsInfo.values()));
        hostsView.promiseShow().then((host) => {
          let hostView = new HostView(host);
          hostView.show();
        }).catch((err) => {
          console.log(err.toString());
        });
      },
      'clearcase:getFile': () => {
        let host = Host.GetVCSHost();
        let filesView = new FilesView(host);
        console.log(`${filesView.host.lastOpenDirectory}`);
        filesView.setPath().then((value) => {
          console.log('show filesView');
          filesView.show();
        });
      },
      'clearcase:upload': () => {
        const fileName = resolveTreeSelection();
        if (!self.projectFilesInfo.has(fileName)) {
          return false;
        }
        let fileInfo = self.projectFilesInfo.get(fileName);
        let extInfo = fileInfo.getExtInfo();
        if (!extInfo || !extInfo['commandHistory'] || !extInfo['commandHistory']['upload']) {
          //TODO:call uploadTo
        } else {
          let comHis = extInfo['commandHistory']['upload'];
          let args = JSON.parse(comHis.getLatestHis());
          let host = self.hostsInfo.get(args['host']);
          Commands.upload(args['remoteDir'], host, fileName).then(() => {
            CommandHistory.updateCommandsHistory(extInfo['commandHistory'], 'upload', args);
          }).catch((err) => {
            console.log(err);
          });
        }
      },
      'clearcase:uploadTo': () => {
        const fileName = resolveTreeSelection();
        let filesView = null;
        let host = null;
        let remoteDir = null;
        let hostsView = new HostsView();
        hostsView.setItems(Array.from(this.hostsInfo.values()));
        hostsView.promiseShow().then((value) => {
          host = value;
          filesView = new FilesView(host, {dirOnly: true});
          return filesView.setPath();
        }).then((value) => {
          return filesView.promiseShow();
        }).then((value) => {
          remoteDir = value.getLocation(host.alias);
          return Commands.upload(remoteDir, host, fileName);
        }).then((value) => {
          if (self.projectFilesInfo.has(fileName)) {
            let fileInfo = self.projectFilesInfo.get(fileName);
            fileInfo.addLocation(host.alias, remoteDir);
            let extInfo = Utils.constructIfNull(fileInfo.getExtInfo(), 'commandHistory');
            CommandHistory.updateCommandsHistory(extInfo['commandHistory'], 'upload', {'host': host.alias, 'remoteDir': remoteDir});
            fileInfo.setExtInfo(extInfo);
          }
          return true;
        }).catch((value) => {
          console.log(value);
        });
      },
      'clearcase:make': () => {
        const fileName = resolveTreeSelection();
        if (!self.projectFilesInfo.has(fileName)) {
          return false;
        }
        let fileInfo = self.projectFilesInfo.get(fileName);
        let extInfo = fileInfo.getExtInfo();
        if (!extInfo || !extInfo['commandHistory'] || !extInfo['commandHistory']['make']) {
          //TODO:call makeTarget
        } else {
          let comHis = extInfo['commandHistory']['make'];
          let args = JSON.parse(comHis.getLatestHis());
          let host = self.hostsInfo.get(args['host']);
          Commands.make(args['remoteDir'], host, args['target']).then(() => {
            CommandHistory.updateCommandsHistory(extInfo['commandHistory'], 'make', args);
          }).catch((err) => {
            console.log(err);
          });
        }
      },
      'clearcase:makeTarget': () => {
        const fileName = resolveTreeSelection();
        let filesView = null;
        let host = null;
        let remoteDir = null;
        let target = null;
        let hostsView = new HostsView();
        hostsView.setItems(Array.from(this.hostsInfo.values()));
        hostsView.promiseShow().then((value) => {
          host = value;
          filesView = new FilesView(host, {dirOnly: true});
          return filesView.setPath();
        }).then((value) => {
          return filesView.promiseShow();
        }).then((remoteFileInfo) => {
          remoteDir = remoteFileInfo.getLocation(host.alias);
          let argView = new OneLineArgsView('all', 'target:');
          return argView.promiseShow();
        }).then((value) => {
          target = value;
          return Commands.make(remoteDir, host, target);
        }).then((value) => {
          console.log(value);
          if (self.projectFilesInfo.has(fileName)) {
            let fileInfo = self.projectFilesInfo.get(fileName);
            let extInfo = Utils.constructIfNull(fileInfo.getExtInfo(), 'commandHistory');
            CommandHistory.updateCommandsHistory(extInfo['commandHistory'], 'make', {'host': host.alias, 'remoteDir': remoteDir, 'target': target});
            fileInfo.setExtInfo(extInfo);
          }
          return true;
        }).catch((err) => {
          console.log(err);
        });
      },
      'clearcase:checkout': () => {
        const fileName = resolveTreeSelection();
        console.log(`file name: ${fileName}`);
        Commands.login().then((value) => {
          return Commands.checkout(fileName, process.env.username + '@' + process.env.computername);
        }).catch((value) => {
          ErrorCheck.showError(value);
        }).then((value) => {
          return refreshTreeViewPath(path.dirname(fileName), self.projectFilesInfo);
        });
      },
      'clearcase:undoCheckout': () => {
        const fileName = resolveTreeSelection();
        console.log(`file name: ${fileName}`);
        Commands.login().then((value) => {
          return Commands.undoCheckout(fileName);
        }).catch((value) => {
          ErrorCheck.showError(value);
        }).then((value) => {
          return refreshTreeViewPath(path.dirname(fileName), self.projectFilesInfo);
        });
      },
      'clearcase:checkin': () => {
        const fileName = resolveTreeSelection();
        console.log(`file name: ${fileName}`);
        Commands.login().then((value) => {
          return Commands.checkin(fileName);
        }).catch((value) => {
          ErrorCheck.showError(value);
        }).then((value) => {
          return refreshTreeViewPath(path.dirname(fileName), self.projectFilesInfo);
        });
      },
      'clearcase:addSourceControl': () => {
        const fileName = resolveTreeSelection();
        const dir = getWorkingDir(fileName, self.projectFilesInfo);
        Commands.login().then((value) => {
          return Commands.checkout(dir, process.env.username + '@' + process.env.computername);
        }).then((value) => {
          return Commands.mkelem(fileName, process.env.username + '@' + process.env.computername, dir);
        }).then((value) => {
          return Commands.checkin(dir);
        }).catch((value) => {
          ErrorCheck.showError(value);
          return Commands.undoCheckout(fileName);
        }).then((value) => {
          return refreshTreeViewPath(path.dirname(fileName), self.projectFilesInfo);
        });;
      },
      'clearcase:refreshFileStatus': () => {
        const projectPath = getProjectPath();
        if (!projectPath) {
          return false;
        }
        refreshTreeViewPath(projectPath, self.projectFilesInfo);
      },
      'clearcase:setActiity': () => {
        const projectPath = getProjectPath();
        if (!projectPath) {
          return false;
        }
        let actView = new OneLineArgsView('Your activity', 'Activity:');
        actView.promiseShow().then((act) => {
          return Commands.setActiity(act, projectPath);
        }).then((value) => {
          atom.notifications.addSuccess('Set Activity Success.', {'detail': value});
        }).catch((err) => {
          console.log(err);
        });
      },
      'clearcase:newProject': () => {
        console.log('pick folder.');
        atom.pickFolder((paths) => {
          if (!paths) {
            return;
          }
          atom.open({'pathsToOpen': paths});

        });
      }
    });
  },
  serialize: function() {
    let self = this;
    return {deserializer: 'ProjectInfo',hosts: Utils.infoMapToJson(this.hostsInfo), files: Utils.infoMapToJson(this.projectFilesInfo)};
  },
  restoreProjectInfo: function(state) {
    let self = this;
    self.hostsInfo = Utils.jsonToInfoMap(state.hosts, Host);
    self.projectFilesInfo = Utils.jsonToInfoMap(state.files, FileInfo);
    return;
  }
};
