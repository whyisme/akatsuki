'use babel';

const CommandHistory = require('./commandHistory');

let restoreMap = {};
restoreMap['commandHistory'] = CommandHistory;

module.exports = {
  fromJSON: (extInfo) => {
    for (let prop in extInfo) {
      if (extInfo.hasOwnProperty(prop) && typeof restoreMap[prop].fromJSON === 'function') {
        extInfo[prop] = restoreMap[prop].fromJSON(extInfo[prop]);
      }
    }
    return extInfo;
  }
};
