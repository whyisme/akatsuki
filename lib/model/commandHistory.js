'use babel';

const Utils = require('../common/utils');

class CommandHistory {
  constructor(command, hisCount = 4) {
    this.init();
    this.command = command;
    this.setHisCount(hisCount);
  }
  init() {
    this.command = '';
    this.hisArr = [];
    this.count = 1;
  }
  add(args) {
    let strArgs = JSON.stringify(args);
    if (!this.hisArr.includes(strArgs)){
      if (this.hisArr.unshift(strArgs) > this.count) {
        this.hisArr.pop();
      }
    } else {
      let i = this.hisArr.indexOf(strArgs);
      this.hisArr.splice(i, 1);
      this.hisArr.unshift(strArgs);
    }
  }
  getLatestHis() {
    return this.hisArr.length > 0 ? this.hisArr[0] : null;
  }
  getHistory() {
    return this.hisArr;
  }
  setHisCount(count) {
    this.count = typeof count === 'number' && count > 0 ? count : this.count;
    while(this.hisArr.length > this.count) {
      this.hisArr.pop();
    }
  }
  getHisCount() {
    return this.count;
  }
}
CommandHistory.fromJSON = (jsonObj) => {
  for (let prop in jsonObj) {
    if (jsonObj.hasOwnProperty(prop)) {
      let comHis = new CommandHistory(prop, typeof jsonObj[prop].count === 'number' ? prop.count : 4);
      comHis.hisArr = jsonObj[prop].hisArr;
      jsonObj[prop] = comHis;
    }
  }
  return jsonObj;
};
CommandHistory.updateCommandsHistory = (hisInfo, command, args) => {
  hisInfo = Utils.constructIfNull(hisInfo, command);
  if (hisInfo[command].constructor.name !== 'CommandHistory') {
    hisInfo[command] = new CommandHistory(command);
  }
  hisInfo[command].add(args);
  return hisInfo;
};
module.exports = CommandHistory;
