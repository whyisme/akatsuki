'use babel';

class CommandHistory {
  constructor(command, hisCount = 4) {
    this.command = command;
    this.count = 0;
    this.count = this.setHisCount(hisCount);
    this.hisArr = [];
  }
  add(args) {
    let strArgs = JSON.stringify(args);
    if (!this.hisArr.includes(strArg)){
      if (this.hisArr.unshift(strArgs) > this.count) {
        this.hisArr.pop();
      }
    }
  }
  getHistory() {
    return this.hisArr;
  }
  setHisCount(count) {
    this.count = hisCount && .constructor.name === 'number' && hisCount >= 0 ? hisCount : this.count;
    while(this.hisArr.length > this.count) {
      this.hisArr.pop();
    }
  }
  getHisCount() {
    return this.count;
  }
}
CommandHistory.updateCommandsHistory = (hisInfo, command, args) => {
  if (!hisInfo) {
    hisInfo = {};
  }
  if (!hisInfo.hasOwnProperty(command)) {
    hisInfo[command] = {};
  }
  if (hisInfo[command].constructor.name !== 'CommandHistory') {
    hisInfo[command] = new CommandHistory(command);
  }
  hisInfo[command].add(args);
  return hisInfo;
};
module.exports = CommandHistory;
