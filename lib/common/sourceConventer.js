'use babel';

let SourceConventerException = function (code, value) {
  this.code = code;
  this.message = `Property ${value} has been used.`;
  this.toString = () => `[${this.code}]${this.message}`;
}

module.exports = {
  addSourceDataType: function (name, formatString, resolver, alias = '') {
    let typesAlias = 'sourceDataTypes';
    if (typeof alias === 'string' && alias.trim()) {
      typesAlias = alias;
    }
    if (typeof this[typesAlias] === 'undefined') {
      this[typesAlias] = {};
    }
    if (typeof this[typesAlias][name] !== 'undefined') {
      throw new SourceConventerException(2, name);
    }
    this[typesAlias][name] = {formatString: formatString, resolver: resolver.bind(this)};
  },
  getSourceDataResolver: function (name, alias = '') {
    let typesAlias = 'sourceDataTypes';
    if (typeof alias === 'string' && alias.trim()) {
      typesAlias = alias;
    }
    if (typeof this[typesAlias][name] === 'undefined' || typeof this[typesAlias][name].resolver !== 'function') {
      throw new SourceConventerException(3, name);
    }
    return this[typesAlias][name].resolver;
  }
};
