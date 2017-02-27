'use babel';

module.exports = {
  infoMapToJson: function(map) {
    let jsonInfo = new Map();
    map.forEach((value, key, map) => {
      jsonInfo.set(key, value.toJSON ? value.toJSON() : value);
    });
    return [...jsonInfo];
  },
  jsonToInfoMap: function(jsonInfo, klass = {}) {
    let map = new Map();
    jsonInfo.forEach((value) => {
      map.set(value[0], klass.fromJSON ? klass.fromJSON(value[1]) : value[1]);
    });
    return map;
  },
  safeSymbolToString: function(symObj) {
    return typeof symObj === 'symbol' ? Symbol.keyFor(symObj) : null;
  },
  constructIfNull: function(obj, prop = null, initVal = {}) {
    if (!obj) {
      obj = {};
    }
    if (prop && !obj.hasOwnProperty(prop)) {
      obj[prop] = initVal;
    }
    return obj;
  }
}
